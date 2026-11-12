// ===== NOTIFICACIONES PUSH (Firebase Cloud Messaging) =====
// IMPORTANTE: reemplaza 'PEGA_AQUI_TU_VAPID_KEY' por la clave real que
// generas en Firebase Console → Configuración del proyecto → Cloud
// Messaging → "Certificados push web" → Generar par de claves. Sin esto,
// activarNotificacionesPush() no va a funcionar.
const VAPID_KEY = 'BEyqvpTrptdqeNNVGDVmH_Xjx8J5mnNNuppspYFHKJ94gZtJEV5YZptlomAUrvwor0yYa3InlUsiZuc7T4PL6XQ';

function activarNotificacionesPush() {
  if (!('Notification' in window) || !firebase.messaging) {
    showCustomAlert('⚠️', 'No disponible', 'Tu navegador no soporta notificaciones push, o el PWA no está instalado.', 'warning');
    return;
  }
  if (VAPID_KEY === 'PEGA_AQUI_TU_VAPID_KEY' ) {
    showCustomAlert('⚠️', 'Falta configurar', 'Todavía falta pegar la VAPID key en el código (ver instrucciones).', 'warning');
    return;
  }
  Notification.requestPermission().then(function(permission) {
    if (permission !== 'granted') {
      actualizarEstadoNotificaciones('Bloqueadas');
      showCustomAlert('🔕', 'Permiso denegado', 'Activa las notificaciones desde la configuración de tu navegador o celular para recibir avisos de cobros recurrentes.', 'warning');
      return;
    }
navigator.serviceWorker.ready.then(function(registration) {
  const messaging = firebase.messaging();
    return messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  }).then(function(token) {
      if (!token || !currentUid) return;
      return getUsuarioDocRef(currentUid).set({
        fcmTokens: firebase.firestore.FieldValue.arrayUnion(token)
      }, { merge: true }).then(function() {
        localStorage.setItem('pushEnabled_v1', 'true');
        actualizarEstadoNotificaciones('Activadas');
        showCustomAlert('✅', '¡Listo!', 'Vas a recibir notificaciones de tus cobros recurrentes y metas de ahorro.', 'success');
      });
    }).catch(function(err) {
      console.error('❌ Error activando notificaciones push:', err);
      showCustomAlert('⚠️', 'Error', 'No se pudo activar. Revisa que copiaste bien la VAPID key.', 'warning');
    });
  });
}
window.activarNotificacionesPush = activarNotificacionesPush;

window.refrescarEstadoNotificaciones = function() {
  try {
    if (!('Notification' in window)) { actualizarEstadoNotificaciones('No disponible'); return; }
    if (Notification.permission === 'denied') actualizarEstadoNotificaciones('Bloqueadas');
    else if (Notification.permission === 'granted' && localStorage.getItem('pushEnabled_v1') === 'true') actualizarEstadoNotificaciones('Activadas ✓');
    else actualizarEstadoNotificaciones('Desactivadas');
  } catch (e) {}
};

function actualizarEstadoNotificaciones(texto) {
  var el = document.getElementById('pushStatusLabel');
  if (el) el.innerText = texto;
}

// Muestra el estado guardado al abrir Settings
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('pushEnabled_v1') === 'true') actualizarEstadoNotificaciones('Activadas');
  updateNotificationsBadge();
});

// Si la app está ABIERTA cuando llega la notificación, FCM no la muestra
// sola (eso solo pasa en segundo plano) — la mostramos nosotros a mano.
if (firebase.messaging && firebase.messaging.isSupported && firebase.messaging.isSupported()) {
  try {
    firebase.messaging().onMessage(function(payload) {
      var n = payload.notification || {};
      showCustomAlert(n.icon || '🔔', n.title || 'Recordatorio', n.body || '', 'success');
    });
  } catch(e) { /* mensajería no disponible en este navegador */ }
}

// ===== IDENTIFICADOR ÚNICO DEL USUARIO =====
let currentUid = null;

// ===== FUNCIÓN PARA ASEGURAR QUE currentUid ESTÉ DEFINIDO =====
// Importante: el uid SIEMPRE debe venir de Firebase Auth (incluida la
// sesión anónima de las cuentas locales). Ya no existe un "profile.id"
// suelto como uid — eso es lo que rompía las reglas de seguridad, porque
// Firestore solo confía en request.auth.uid, y ese id local nunca coincidía
// con ningún usuario autenticado de verdad.
function asegurarUid() {
  if (currentUid) return currentUid;
  const user = firebase.auth().currentUser;
  if (user) {
    currentUid = user.uid;
    console.log('🔄 Uid recuperado de Firebase Auth:', currentUid);
    return currentUid;
  }
  console.warn('⚠️ No se pudo obtener ningún uid.');
  return null;
}

