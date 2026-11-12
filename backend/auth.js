// ===== LOGIN CON GOOGLE =====
document.getElementById('btnGoogleLogin').addEventListener('click', function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => console.log('✅ Usuario Google autenticado'))
    .catch(error => {
      console.error('❌ Error login Google:', error);
      alert('Error al iniciar con Google: ' + error.message);
    });
});

// ===== LOGIN CON APPLE =====
document.getElementById('btnAppleLogin').addEventListener('click', function() {
  const provider = new firebase.auth.OAuthProvider('apple.com');
  firebase.auth().signInWithPopup(provider)
    .then(() => console.log('✅ Usuario Apple autenticado'))
    .catch(error => {
      console.error('❌ Error login Apple:', error);
      alert('Error al iniciar con Apple: ' + error.message);
    });
});

// ===== CERRAR SESIÓN =====
function limpiarEstadoYVolverAlOnboarding() {
  if (_tableroUnsubscribe) { _tableroUnsubscribe(); _tableroUnsubscribe = null; }
  if (_boardsListUnsubscribe) { _boardsListUnsubscribe(); _boardsListUnsubscribe = null; }
  currentBoardId = null;
  userBoards = [];
  document.getElementById('monaiOnboarding').classList.remove('monai-hidden');
  document.getElementById('app').style.display = 'none';
  document.getElementById('settingsModal').classList.remove('open');
  currentUid = null;
}

function cerrarSesion() {
  var esAnonimo = firebase.auth().currentUser && firebase.auth().currentUser.isAnonymous;

  if (esAnonimo) {
    // Cuentas locales (PIN): NO cerramos la sesión anónima de Firebase.
    // Si hiciéramos signOut() aquí, ese uid anónimo se pierde para siempre
    // y la próxima vez que entren con el mismo PIN les tocaría un uid nuevo,
    // quedando sin acceso a lo que ya tenían sincronizado. Solo cerramos
    // la "sesión" del perfil local; el uid anónimo queda listo para
    // reengancharse la próxima vez que entren con el PIN correcto.
    if (window.MonAiAuth) window.MonAiAuth.logout();
    limpiarEstadoYVolverAlOnboarding();
    console.log('✅ Sesión local cerrada (se conserva el uid para la próxima vez)');
  } else {
    firebase.auth().signOut()
      .then(() => {
        limpiarEstadoYVolverAlOnboarding();
        console.log('✅ Sesión cerrada');
      })
      .catch(error => {
        console.error('❌ Error al cerrar sesión:', error);
        alert('Error al cerrar sesión: ' + error.message);
      });
  }
}

// ===== OBSERVADOR DE AUTENTICACIÓN (FIREBASE AUTH) =====
firebase.auth().onAuthStateChanged(function(user) {
  try { if (user) localStorage.setItem('hadSession_v1', '1'); else localStorage.removeItem('hadSession_v1'); } catch (e) {}
  if (user && user.isAnonymous) {
    // Sesión anónima ya existente en este navegador (de antes de pasar a
    // login real con email/Google/Apple): se deja entrar directo con ese
    // mismo uid, para no perder los datos que ya tenía sincronizados.
    // Ya no se crean sesiones anónimas nuevas desde el onboarding.
    console.log('✅ Sesión anónima existente activa (UID:', user.uid, ')');
    document.getElementById('monaiOnboarding').classList.add('monai-hidden');
    document.getElementById('app').style.display = 'block';
    iniciarSesionConUsuario(user.uid, null, 'local');
  } else if (user) {
    const uid = user.uid;
    const metodo = (user.providerData && user.providerData[0] && user.providerData[0].providerId === 'apple.com') ? 'apple'
      : (user.providerData && user.providerData[0] && user.providerData[0].providerId === 'google.com') ? 'google' : 'password';
    console.log('✅ Usuario autenticado (Firebase):', user.displayName || user.email, '(UID:', uid, ', método:', metodo, ')');
    document.getElementById('monaiOnboarding').classList.add('monai-hidden');
    document.getElementById('app').style.display = 'block';
    iniciarSesionConUsuario(uid, user.email, metodo);
  } else {
    currentUid = null;
    document.getElementById('monaiOnboarding').classList.remove('monai-hidden');
    document.getElementById('app').style.display = 'none';
  }
});

// ===== LOGIN REAL CON EMAIL + CONTRASEÑA =====
function goProErrorAuthTexto(error) {
  var es = language === 'es';
  var code = error && error.code;
  if (code === 'auth/email-already-in-use') return es ? 'Ese correo ya tiene una cuenta. Intenta iniciar sesión.' : 'That email already has an account. Try logging in.';
  if (code === 'auth/invalid-email') return es ? 'Ese correo no es válido.' : 'That email is not valid.';
  if (code === 'auth/weak-password') return es ? 'La contraseña debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials' || code === 'auth/invalid-password') return es ? 'Correo o contraseña incorrectos.' : 'Incorrect email or password.';
  if (code === 'auth/too-many-requests') return es ? 'Demasiados intentos. Espera un momento.' : 'Too many attempts. Wait a moment.';
  if (code === 'auth/operation-not-allowed') return es ? 'El inicio de sesión con correo está desactivado en Firebase (Authentication → Sign-in method).' : 'Email sign-in is disabled in Firebase (Authentication → Sign-in method).';
  if (code === 'auth/network-request-failed') return es ? 'Sin conexión. Revisa tu internet e intenta de nuevo.' : 'No connection. Check your internet and try again.';
  if (code === 'auth/popup-blocked') return es ? 'El navegador bloqueó la ventana de Google/Apple. Permite las ventanas emergentes.' : 'The browser blocked the Google/Apple window. Allow pop-ups.';
  if (code === 'auth/unauthorized-domain') return es ? 'Este dominio no está autorizado en Firebase Authentication.' : 'This domain is not authorized in Firebase Authentication.';
  return es ? 'Ocurrió un error. Intenta de nuevo.' : 'Something went wrong. Try again.';
}

window.crearCuentaConEmailYPassword = function() {
  var errEl = document.getElementById('monaiCreateError');
  errEl.textContent = '';
  var es = language === 'es';
  var name = (document.getElementById('monaiName').value || '').trim();
  var email = (document.getElementById('monaiEmailCreate').value || '').trim();
  var password = document.getElementById('monaiPasswordCreate').value || '';
  if (!name) { errEl.textContent = es ? 'Escribe tu nombre.' : 'Enter your name.'; return; }
  if (!email) { errEl.textContent = es ? 'Escribe tu correo.' : 'Enter your email.'; return; }
  if (password.length < 8) { errEl.textContent = es ? 'La contraseña debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.'; return; }

  var current = firebase.auth().currentUser;
  if (current && current.isAnonymous) {
    // Ya había datos guardados en este navegador (sesión anónima): se
    // "convierte" esa misma cuenta a email/contraseña sin perder nada, en
    // vez de crear una cuenta nueva desde cero.
    var credential = firebase.auth.EmailAuthProvider.credential(email, password);
    current.linkWithCredential(credential)
      .then(function(result) { return result.user.updateProfile({ displayName: name }); })
      .then(function() { iniciarSesionConUsuario(current.uid, email, 'password'); })
      .catch(function(error) { errEl.textContent = goProErrorAuthTexto(error); });
  } else {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(result) { return result.user.updateProfile({ displayName: name }); })
      .catch(function(error) { errEl.textContent = goProErrorAuthTexto(error); });
  }
};

window.iniciarSesionConEmailYPassword = function() {
  var errEl = document.getElementById('monaiLoginError');
  errEl.textContent = '';
  var es = language === 'es';
  var email = (document.getElementById('monaiEmailLogin').value || '').trim();
  var password = document.getElementById('monaiPasswordLogin').value || '';
  if (!email || !password) { errEl.textContent = es ? 'Completa correo y contraseña.' : 'Fill in email and password.'; return; }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(function(error) { errEl.textContent = goProErrorAuthTexto(error); });
};

// ===== ARRANQUE INSTANTANEO =====
// Si la ultima vez habia una sesion activa, mostramos la app de una con los
// datos guardados en el dispositivo mientras Firebase confirma en segundo plano.
try {
  if (localStorage.getItem('hadSession_v1') === '1') {
    document.getElementById('monaiOnboarding').classList.add('monai-hidden');
    document.getElementById('app').style.display = 'block';
    renderApp();
  }
} catch (e) { console.warn('Arranque instantaneo no disponible:', e); }

console.log('🔥 App conectada a Firebase — VERSION_ARCHIVO: fase2y3-tableros-y-cuenta');
