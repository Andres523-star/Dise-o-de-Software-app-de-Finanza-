// ===== FASE 2: SISTEMA DE MÚLTIPLES TABLEROS =====
// Antes había UN SOLO documento por usuario en "usuarios/{uid}" con todos sus
// datos. Ahora cada usuario puede tener VARIOS tableros. Estructura nueva:
//
//   usuarios/{uid}      -> { email, authMethod, boardIds:[...], activeBoardId }
//   tableros/{boardId}  -> { name, ownerUid, members:[uids], pendingShares:[correos],
//                             createdAt, data:{ ...todo lo que antes vivía en usuarios/{uid} } }
//
// "members" son los uids que pueden ver/editar ese tablero (dueño + a quien
// se le comparta). "pendingShares" son correos invitados que todavía no han
// iniciado sesión en la app (ver revisarInvitacionesPendientes).
//
// Todo sigue siendo en tiempo real (onSnapshot), igual que en la Fase 1 —
// eso no se pierde, solo cambia DÓNDE vive cada cosa.

let currentBoardId = null;    // tablero actualmente abierto
let userBoards = [];          // tableros a los que el usuario tiene acceso (propios + compartidos)
let userEmail = null;
let userAuthMethod = 'local'; // 'google' | 'apple' | 'local'

let _tableroUnsubscribe = null;     // listener en tiempo real del tablero activo
let _boardsListUnsubscribe = null;  // listener en tiempo real de la LISTA de tableros

function getUsuarioDocRef(uid) { return db.collection('usuarios').doc(uid); }
function getTableroDocRef(id) { return db.collection('tableros').doc(id); }

// Paquete de datos "en blanco" para un tablero recién creado.
function crearPaqueteDeDatosVacio() {
  // Colores por defecto para las tarjetas iniciales
  const defaultCardColors = {
    'Nu': '#1a73e8',
    'Nequi': '#7c3aed',
    'DolarApp': '#059669'
  };
  return {
    transacciones: [],
    allCategories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES_SNAPSHOT)),
    myCards: DEFAULT_CARDS_SNAPSHOT.slice(),
    isUSD: false,
    primaryCurrency: 'COP',
    secondaryCurrencies: ['USD'],
    language: 'es',
    deletedCategories: {},
    categoryColors: {},
    cardColors: defaultCardColors,
    recurringCharges: [],
    negativeBalanceAlert: null,
    appLastSeenMonthIdx: null,
    appLastSeenYear: null,
    exchangeRate: 3250,
    fechaActualizacion: new Date().toISOString()
  };
}

// ===== EMPAQUETAR EL ESTADO ACTUAL DE LA APP (el tablero que se está viendo) =====
function buildFullBackupObject() {
  return {
    transacciones: transactions,
    allCategories: allCategories,
    myCards: myCards,
    isUSD: isUSD,
    primaryCurrency: primaryCurrency,
    secondaryCurrencies: secondaryCurrencies,
    language: language,
    deletedCategories: deletedCategories,
    categoryColors: (typeof categoryColors !== 'undefined') ? categoryColors : {},
    categoryIconColors: (typeof categoryIconColors !== 'undefined') ? categoryIconColors : {},
    cardColors: (typeof cardColors !== 'undefined') ? cardColors : {},
    categoryCurrencies: (typeof categoryCurrencies !== 'undefined') ? categoryCurrencies : {},
    recurringCharges: recurringCharges,
    negativeBalanceAlert: negativeBalanceAlert,
    appLastSeenMonthIdx: localStorage.getItem('appLastSeenMonthIdx_v28'),
    appLastSeenYear: localStorage.getItem('appLastSeenYear_v28'),
    exchangeRate: exchangeRate,
    fechaActualizacion: new Date().toISOString()
  };
}

// Evita guardar en Firestore mientras se está aplicando un cambio que ACABA
// DE LLEGAR desde la nube (si no, se podría reenviar de vuelta en bucle).
let _cargandoDesdeFirebase = false;
let _arranqueRapido = false;

// Debounce corto (350ms) + red de seguridad al cambiar de pestaña/recargar,
// igual que en la Fase 1.
let _guardarFirebaseTimer = null;
function scheduleGuardarEnFirebase() {
  if (_cargandoDesdeFirebase) return;
  if (_guardarFirebaseTimer) clearTimeout(_guardarFirebaseTimer);
  _guardarFirebaseTimer = setTimeout(guardarEnFirebase, 350);
}
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden' && _guardarFirebaseTimer) {
    clearTimeout(_guardarFirebaseTimer);
    _guardarFirebaseTimer = null;
    guardarEnFirebase();
  }
});
window.addEventListener('pagehide', function() {
  if (_guardarFirebaseTimer) {
    clearTimeout(_guardarFirebaseTimer);
    _guardarFirebaseTimer = null;
    guardarEnFirebase();
  }
});

// ===== GUARDAR EL TABLERO ACTIVO EN FIRESTORE =====
function guardarEnFirebase() {
  if (_cargandoDesdeFirebase) return;
  if (!currentUid || !currentBoardId) {
    console.warn('⚠️ No hay uid o tablero activo. No se guarda.');
    return;
  }
  getTableroDocRef(currentBoardId).set({ data: buildFullBackupObject() }, { merge: true })
    .then(() => console.log('✅ Tablero guardado:', currentBoardId))
    .catch(error => {
      console.error('❌ Error al guardar el tablero:', error);
      showCustomAlert(
        '⚠️',
        'No se pudo guardar',
        'Firebase respondió: "' + (error && error.message ? error.message : error) + '". Si dice "permission-denied", revisa las reglas de Firestore en Firebase Console.',
        'warning'
      );
    });
}

// ===== ESCUCHAR EL TABLERO ACTIVO EN TIEMPO REAL =====
function escucharTableroActivo(boardId) {
  if (_tableroUnsubscribe) { _tableroUnsubscribe(); _tableroUnsubscribe = null; }
  if (!boardId) { renderApp(); return; }

  _tableroUnsubscribe = getTableroDocRef(boardId).onSnapshot((doc) => {
    if (doc.metadata && doc.metadata.hasPendingWrites) return; // eco de nuestra propia escritura

    _cargandoDesdeFirebase = true;

    if (doc.exists) {
      const board = doc.data();
      const data = board.data || {};

      transactions = data.transacciones || [];

      if (data.allCategories && data.allCategories.length > 0) {
        allCategories.length = 0;
        data.allCategories.forEach(function(c) { allCategories.push(c); });
      }
      if (data.myCards) myCards = data.myCards;
      if (data.primaryCurrency) {
        primaryCurrency = data.primaryCurrency;
        secondaryCurrencies = data.secondaryCurrencies && data.secondaryCurrencies.length > 0 ? data.secondaryCurrencies : ['USD'];
      } else if (data.isUSD !== undefined) {
        // tablero guardado antes de este cambio: migrar desde isUSD
        primaryCurrency = data.isUSD ? 'USD' : 'COP';
        secondaryCurrencies = data.isUSD ? ['COP'] : ['USD'];
      }
      isUSD = data.isUSD !== undefined ? data.isUSD : (primaryCurrency === 'USD');
      saveCurrencySettings();
      if (data.language) language = data.language;
      if (data.deletedCategories) deletedCategories = data.deletedCategories;
      if (data.categoryColors) categoryColors = data.categoryColors;
      if (data.categoryIconColors) categoryIconColors = data.categoryIconColors;
      if (data.cardColors) {
        cardColors = data.cardColors;
      } else {
        // Fallback a localStorage si el tablero no tiene cardColors guardados
        try {
          const stored = localStorage.getItem('cardColors_v1');
          if (stored) cardColors = JSON.parse(stored);
        } catch(e) {}
      }
      if (data.categoryCurrencies) {
        categoryCurrencies = data.categoryCurrencies;
        try { localStorage.setItem('categoryCurrencies_v28', JSON.stringify(categoryCurrencies)); } catch (e) {}
      }
      if (data.recurringCharges) recurringCharges = data.recurringCharges;
      if (data.negativeBalanceAlert !== undefined) negativeBalanceAlert = data.negativeBalanceAlert;
      if (data.exchangeRate) exchangeRate = data.exchangeRate;
      if (data.appLastSeenMonthIdx) localStorage.setItem('appLastSeenMonthIdx_v28', data.appLastSeenMonthIdx);
      if (data.appLastSeenYear) localStorage.setItem('appLastSeenYear_v28', data.appLastSeenYear);

      saveAppStateToStorage();
      saveRecurringChargesToStorage();

      const nameEl = document.getElementById('activeBoardName');
      if (nameEl) nameEl.innerText = board.name || 'My finances';

      console.log('🔄 Tablero sincronizado:', board.name, '(' + transactions.length + ' tx, ' + allCategories.length + ' categorías)');
    } else {
      console.warn('⚠️ Ese tablero ya no existe (puede que lo hayan borrado desde otro dispositivo).');
    }

    renderApp();
    _cargandoDesdeFirebase = false;
  }, (error) => {
    console.error('❌ Error al escuchar el tablero:', error);
    _cargandoDesdeFirebase = false;
    if (_arranqueRapido) { _arranqueRapido = false; currentBoardId = null; return; }
    showCustomAlert('⚠️', 'Se perdió la sincronización', 'Firebase respondió: "' + (error && error.message ? error.message : error) + '".', 'warning');
  });
}

// ===== ESCUCHAR LA LISTA DE TABLEROS DEL USUARIO EN TIEMPO REAL =====
// (propios + compartidos). Se actualiza sola si otro dispositivo crea,
// renombra, comparte o borra un tablero.
function escucharListaDeTableros(uid) {
  if (_boardsListUnsubscribe) { _boardsListUnsubscribe(); _boardsListUnsubscribe = null; }
  _boardsListUnsubscribe = db.collection('tableros').where('members', 'array-contains', uid)
    .onSnapshot((snap) => {
      userBoards = [];
      snap.forEach((doc) => {
        const b = doc.data();
        userBoards.push({ id: doc.id, name: b.name || 'Sin nombre', ownerUid: b.ownerUid, members: b.members || [] });
      });
      applyBoardOrder();
      renderBoardSelectorList();
      renderAccountBoardList();
    }, (err) => console.error('❌ Error al escuchar la lista de tableros:', err));
}

// ===== ORDEN PERSONALIZADO DE TABLEROS (arrastrar con el ☰) =====
// Firestore no garantiza ningún orden fijo, así que guardamos el orden que
// el usuario eligió en localStorage y lo reaplicamos cada vez que la lista
// se refresca. El primero de la lista pasa a ser el tablero que se abre
// automáticamente la próxima vez que entre a la app.
let boardOrder = [];
try {
  var storedBoardOrder = localStorage.getItem('boardOrder_v1');
  if (storedBoardOrder) boardOrder = JSON.parse(storedBoardOrder);
} catch(e) { boardOrder = []; }

function applyBoardOrder() {
  userBoards.sort(function(a, b) {
    var ia = boardOrder.indexOf(a.id); if (ia === -1) ia = 9999;
    var ib = boardOrder.indexOf(b.id); if (ib === -1) ib = 9999;
    return ia - ib;
  });
}

function saveBoardOrder() {
  boardOrder = userBoards.map(function(b) { return b.id; });
  localStorage.setItem('boardOrder_v1', JSON.stringify(boardOrder));
  // El primero de la lista queda como el tablero por defecto la próxima vez
  // que se abra la app (sin forzar el cambio ahora mismo, para no
  // interrumpir lo que el usuario está viendo).
  if (userBoards[0] && currentUid) {
    try { localStorage.setItem('principalBoard_v1_' + currentUid, userBoards[0].id); } catch (e) {}
    getUsuarioDocRef(currentUid).set({ boardOrder: boardOrder, activeBoardId: userBoards[0].id }, { merge: true }).catch(function() {});
  }
}

function reorderBoards(fromId, toId) {
  if (fromId === toId) return;
  var fromIdx = userBoards.findIndex(function(b) { return b.id === fromId; });
  var toIdx = userBoards.findIndex(function(b) { return b.id === toId; });
  if (fromIdx === -1 || toIdx === -1) return;
  var moved = userBoards.splice(fromIdx, 1)[0];
  userBoards.splice(toIdx, 0, moved);
  saveBoardOrder();
  renderBoardSelectorList();
  renderAccountBoardList();
}
window.reorderBoards = reorderBoards;

// ===== COMPARTIR POR CORREO (sin backend propio) =====
// Como esta app no tiene servidor propio, no hay forma de "buscar un uid por
// correo" directamente. Guardamos el correo invitado en "pendingShares" del
// tablero. Cuando ESA persona inicia sesión (Google/Apple) con ese correo,
// la app revisa automáticamente si hay invitaciones pendientes y la agrega.
function revisarInvitacionesPendientes(uid, email) {
  if (!email) return Promise.resolve();
  const correo = email.toLowerCase();
  return db.collection('tableros').where('pendingShares', 'array-contains', correo).get()
    .then((snap) => {
      if (snap.empty) return Promise.resolve();
      const tareas = [];
      snap.forEach((doc) => {
        const b = doc.data();
        const members = b.members || [];
        if (members.indexOf(uid) === -1) members.push(uid);
        const pending = (b.pendingShares || []).filter((e) => e !== correo);
        tareas.push(doc.ref.update({ members: members, pendingShares: pending }));
        tareas.push(
          getUsuarioDocRef(uid).get().then((uDoc) => {
            const boardIds = (uDoc.exists && uDoc.data().boardIds) ? uDoc.data().boardIds : [];
            if (boardIds.indexOf(doc.id) === -1) boardIds.push(doc.id);
            return getUsuarioDocRef(uid).set({ boardIds: boardIds }, { merge: true });
          })
        );
      });
      return Promise.all(tareas);
    });
}

// ===== PUNTO DE ENTRADA PRINCIPAL AL INICIAR SESIÓN =====
// Revisa "usuarios/{uid}" para saber qué tablero(s) tiene. Si el usuario
// viene del sistema viejo (Fase 1, un documento con todo adentro
// directamente en usuarios/{uid}) lo migra automáticamente a un tablero
// nuevo llamado "My finances" SIN que pierda nada.
function iniciarSesionConUsuario(uid, email, authMethod) {
  currentUid = uid;
  userEmail = email || null;
  userAuthMethod = authMethod || 'local';
  updateCurrencyRates();

  // ARRANQUE RAPIDO: si ya sabemos cual es el tablero principal de este usuario,
  // empezamos a escuchar YA (los datos salen del cache local al instante) sin
  // esperar a leer el documento del usuario.
  let _principalCache = null;
  try { _principalCache = localStorage.getItem('principalBoard_v1_' + uid); } catch (e) {}
  if (_principalCache) {
    currentBoardId = _principalCache;
    _arranqueRapido = true;
    escucharTableroActivo(currentBoardId);
  }

  getUsuarioDocRef(uid).get().then((userDoc) => {
    const yaTieneTableros = userDoc.exists && userDoc.data().boardIds && userDoc.data().boardIds.length > 0;
    if (yaTieneTableros) {
      const udata = userDoc.data();
      // Orden de tableros guardado en la nube (igual en Mac y celular)
      if (udata.boardOrder && udata.boardOrder.length) {
        boardOrder = udata.boardOrder;
        try { localStorage.setItem('boardOrder_v1', JSON.stringify(boardOrder)); } catch (e) {}
      }
      // El PRIMERO de la lista es el principal y es el que se abre siempre
      const primeroValido = (udata.boardOrder || []).find((id) => udata.boardIds.indexOf(id) !== -1);
      const principalId = primeroValido || udata.activeBoardId || udata.boardIds[0];
      try { localStorage.setItem('principalBoard_v1_' + uid, principalId); } catch (e) {}
      const yaEscuchando = (principalId === currentBoardId) && _tableroUnsubscribe;
      currentBoardId = principalId;
      if (yaEscuchando) _arranqueRapido = false;
      // Actualiza email/authMethod por si cambiaron (ej. primera vez que se ve el correo)
      getUsuarioDocRef(uid).set({ email: userEmail, authMethod: userAuthMethod }, { merge: true }).catch(() => {});
      revisarInvitacionesPendientes(uid, userEmail).then(() => {
        if (!yaEscuchando) escucharTableroActivo(currentBoardId);
        escucharListaDeTableros(uid);
      });
    } else {
      migrarAFormatoDeTableros(uid, userDoc, userEmail, userAuthMethod);
    }
  }).catch((err) => {
    console.error('❌ Error al leer el usuario:', err);
    renderApp();
  });
}

// Convierte a un usuario del formato viejo (Fase 1, todo en usuarios/{uid})
// o crea su primer tablero si es totalmente nuevo.
function migrarAFormatoDeTableros(uid, userDoc, email, authMethod) {
  const tieneDatosViejos = userDoc.exists && userDoc.data() && userDoc.data().transacciones !== undefined;
  const dataVieja = tieneDatosViejos ? userDoc.data() : null;

  const paqueteInicial = dataVieja ? {
    transacciones: dataVieja.transacciones || [],
    allCategories: dataVieja.allCategories || JSON.parse(JSON.stringify(DEFAULT_CATEGORIES_SNAPSHOT)),
    myCards: dataVieja.myCards || DEFAULT_CARDS_SNAPSHOT.slice(),
    isUSD: dataVieja.isUSD || false,
    primaryCurrency: dataVieja.primaryCurrency || (dataVieja.isUSD ? 'USD' : 'COP'),
    secondaryCurrencies: dataVieja.secondaryCurrencies || (dataVieja.isUSD ? ['COP'] : ['USD']),
    language: dataVieja.language || 'es',
    deletedCategories: dataVieja.deletedCategories || {},
    categoryColors: dataVieja.categoryColors || {},
    recurringCharges: dataVieja.recurringCharges || [],
    negativeBalanceAlert: dataVieja.negativeBalanceAlert || null,
    appLastSeenMonthIdx: dataVieja.appLastSeenMonthIdx || null,
    appLastSeenYear: dataVieja.appLastSeenYear || null,
    exchangeRate: dataVieja.exchangeRate || 3250,
    fechaActualizacion: new Date().toISOString()
  } : crearPaqueteDeDatosVacio();

  const nuevoBoardRef = db.collection('tableros').doc();
  nuevoBoardRef.set({
    name: 'My finances',
    ownerUid: uid,
    members: [uid],
    pendingShares: [],
    createdAt: new Date().toISOString(),
    data: paqueteInicial
  }).then(() => {
    return getUsuarioDocRef(uid).set({
      email: email || null,
      authMethod: authMethod || 'local',
      boardIds: [nuevoBoardRef.id],
      activeBoardId: nuevoBoardRef.id
    }, { merge: true });
  }).then(() => {
    console.log(tieneDatosViejos ? '✅ Migración completa: tus datos anteriores ahora viven en el tablero "My finances".' : '✅ Primer tablero creado.');
    currentBoardId = nuevoBoardRef.id;
    escucharTableroActivo(currentBoardId);
    escucharListaDeTableros(uid);
  }).catch((err) => {
    console.error('❌ Error migrando/creando el primer tablero:', err);
    renderApp();
  });
}

// ===== ABRIR / CERRAR EL SELECTOR DE TABLEROS =====
window.openBoardSelector = function() {
  document.getElementById('boardSelectorModal').classList.add('open');
  renderBoardSelectorList();
};
window.closeBoardSelector = function() {
  document.getElementById('boardSelectorModal').classList.remove('open');
};

// ===== MENÚ DE ⋮ DEL TABLERO ACTIVO (en el header) =====
window.toggleBoardMenu = function() {
  const menu = document.getElementById('boardOptionsMenu');
  if (menu) menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
};
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    document.querySelectorAll('.modal-overlay.open').forEach(function(m) {
      m.classList.remove('open');
    });
    previousModalIdBeforeCardWizard = null;
  }
  if (e.target.classList.contains('custom-alert-overlay')) {
    closeCustomAlert();
  }
  // Cerrar menús de ahorro (Fase 4)
  if (!e.target.closest('.savings-menu-btn') && !e.target.closest('.savings-item-menu')) {
    document.querySelectorAll('.savings-item-menu').forEach(function(m) { m.style.display = 'none'; });
  }


// === NUEVO: Cerrar menús de editar categorías ===
  if (!e.target.closest('.edit-category-menu-btn') && !e.target.closest('.edit-category-item-menu')) {
    document.querySelectorAll('.edit-category-item-menu').forEach(function(m) { m.style.display = 'none'; });
  }
});

// ===== RENDER DE LAS LISTAS DE TABLEROS (selector + info de cuenta) =====
function renderBoardSelectorList() {
  const cont = document.getElementById('boardListContainer');
  if (!cont) return;
  cont.innerHTML = '';
  userBoards.forEach((b) => cont.appendChild(crearFilaDeTablero(b, 'boardListContainer', false)));
}
function renderAccountBoardList() {
  const cont = document.getElementById('accBoardList');
  if (!cont) return;
  cont.innerHTML = '';
  userBoards.forEach((b) => cont.appendChild(crearFilaDeTablero(b, 'accBoardList', false)));
}
function crearFilaDeTablero(b, containerId, botonesVisibles) {
  const esActivo = (b.id === currentBoardId);
  const esCompartido = b.ownerUid !== currentUid;
  const menuId = 'rowBoardMenu_' + containerId + '_' + b.id;
  const puedeArrastrar = userBoards.length > 1;
  const esPrincipal = puedeArrastrar && userBoards[0] && userBoards[0].id === b.id;

  const row = document.createElement('div');
  row.dataset.dragId = b.id;
  row.className = 'board-row-drag';
  row.style.cssText = 'position:relative; display:flex; align-items:center; justify-content:space-between; gap:8px; background:#f8f9fa; padding:14px 16px; border-radius:16px; border:2px solid transparent;';
  row.oncontextmenu = function(e) { e.preventDefault(); };
  if (esPrincipal) { row.style.background = '#fbf3d9'; row.style.borderColor = '#f0e0a6'; }

  // Mantener presionado 0.4s sobre la fila (fuera de los botones) = modo arrastre
  if (puedeArrastrar) {
    row.onpointerdown = function(e) {
      if (e.target.closest('button') || e.target.closest('.row-board-menu')) return;
      cxHandleDown(e, b.id, containerId, reorderBoards, 400);
    };
  }

  const left = document.createElement('div');
  left.style.cssText = 'flex:1; cursor:pointer; font-weight:700; font-size:15px; color:#1a1a1a; min-width:0;';
  left.innerText = b.name + (esActivo ? ' ✓' : '') + (esCompartido ? '  🔗' : '');
  left.onclick = function() { if (window._cxJustDragged) return; switchToBoard(b.id); };
  row.appendChild(left);

  if (botonesVisibles) {
    // Opciones siempre visibles (Info de cuenta)
    const acts = document.createElement('div');
    acts.className = 'board-inline-actions';
    [['✏️', '', function() { editBoardName(b.id); }],
     ['🔗', '', function() { shareBoard(b.id); }],
     ['🗑️', 'del', function() { confirmDeleteBoard(b.id); }]].forEach(function(o) {
      const bt = document.createElement('button');
      bt.innerText = o[0];
      if (o[1]) bt.className = o[1];
      bt.onclick = function(e) { e.stopPropagation(); o[2](); };
      acts.appendChild(bt);
    });
    row.appendChild(acts);
    return row;
  }

  const dotsBtn = document.createElement('button');
  dotsBtn.style.cssText = 'background:none; border:none; cursor:pointer; font-size:18px; padding:0 4px; color:#1a1a1a;';
  dotsBtn.innerText = '⋮';
  dotsBtn.onclick = function(e) {
    e.stopPropagation();
    document.querySelectorAll('.row-board-menu').forEach((m) => { if (m.id !== menuId) m.style.display = 'none'; });
    const m = document.getElementById(menuId);
    if (m) m.style.display = (m.style.display === 'block') ? 'none' : 'block';
  };
  row.appendChild(dotsBtn);

  const menu = document.createElement('div');
  menu.className = 'board-options-menu row-board-menu';
  menu.id = menuId;
  menu.style.display = 'none';
  menu.innerHTML =
    '<div class="board-option-item">✏️ Editar nombre</div>' +
    '<div class="board-option-item">🔗 Compartir tablero</div>' +
    '<div class="board-option-item delete">🗑️ Eliminar tablero</div>';
  menu.children[0].onclick = function(e) { e.stopPropagation(); editBoardName(b.id); };
  menu.children[1].onclick = function(e) { e.stopPropagation(); shareBoard(b.id); };
  menu.children[2].onclick = function(e) { e.stopPropagation(); confirmDeleteBoard(b.id); };
  row.appendChild(menu);

  return row;
}

// ===== CAMBIAR DE TABLERO =====
window.switchToBoard = function(boardId) {
  if (boardId === currentBoardId) { closeBoardSelector(); closeAccountInfo(); return; }
  currentBoardId = boardId;
  getUsuarioDocRef(currentUid).set({ activeBoardId: boardId }, { merge: true }).catch(() => {});
  escucharTableroActivo(boardId);
  closeBoardSelector();
  closeAccountInfo();
};

// ===== CREAR TABLERO NUEVO =====
window.createNewBoard = function() {
  showTextPrompt('＋ Nuevo tablero', 'Ej: Finanzas de mi tienda', '', function(nombre) {
    nombre = (nombre || '').trim();
    if (!nombre) return 'Escribe un nombre para el tablero.';
    const nuevoRef = db.collection('tableros').doc();
    nuevoRef.set({
      name: nombre,
      ownerUid: currentUid,
      members: [currentUid],
      pendingShares: [],
      createdAt: new Date().toISOString(),
      data: crearPaqueteDeDatosVacio()
    }).then(() => {
      return getUsuarioDocRef(currentUid).get();
    }).then((uDoc) => {
      const boardIds = (uDoc.exists && uDoc.data().boardIds) ? uDoc.data().boardIds : [];
      boardIds.push(nuevoRef.id);
      return getUsuarioDocRef(currentUid).set({ boardIds: boardIds, activeBoardId: nuevoRef.id }, { merge: true });
    }).then(() => {
      currentBoardId = nuevoRef.id;
      closeTextPrompt();
      closeBoardSelector();
      closeAccountInfo();
      escucharTableroActivo(currentBoardId);
    }).catch((err) => console.error('❌ Error creando tablero:', err));
  });
};

// ===== EDITAR NOMBRE DE UN TABLERO =====
window.editBoardName = function(boardId) {
  boardId = boardId || currentBoardId;
  const actual = (userBoards.find((b) => b.id === boardId) || {}).name || '';
  showTextPrompt('✏️ Editar nombre', 'Nombre del tablero', actual, function(nuevoNombre) {
    nuevoNombre = (nuevoNombre || '').trim();
    if (!nuevoNombre) return 'Escribe un nombre para el tablero.';
    getTableroDocRef(boardId).update({ name: nuevoNombre }).then(() => {
      closeTextPrompt();
      if (boardId === currentBoardId) {
        const nameEl = document.getElementById('activeBoardName');
        if (nameEl) nameEl.innerText = nuevoNombre;
      }
    }).catch((err) => console.error('❌ Error renombrando tablero:', err));
  });
};

// ===== COMPARTIR UN TABLERO POR CORREO =====
window.shareBoard = function(boardId) {
  boardId = boardId || currentBoardId;
  showTextPrompt('🔗 Compartir tablero', 'Correo de la persona (Google)', '', function(correo) {
    correo = (correo || '').trim().toLowerCase();
    if (!correo || correo.indexOf('@') === -1) return 'Escribe un correo válido.';
    getTableroDocRef(boardId).get().then((doc) => {
      if (!doc.exists) return;
      const b = doc.data();
      const pending = b.pendingShares || [];
      if (pending.indexOf(correo) === -1) pending.push(correo);
      return doc.ref.update({ pendingShares: pending });
    }).then(() => {
      closeTextPrompt();
      showCustomAlert('🔗', 'Invitación enviada', 'Cuando "' + correo + '" inicie sesión con Google en la app usando ese correo, va a tener acceso a este tablero automáticamente.');
    }).catch((err) => console.error('❌ Error compartiendo tablero:', err));
  });
};

// ===== ELIMINAR TABLERO (con doble confirmación) =====
window.confirmDeleteBoard = function(boardId) {
  boardId = boardId || currentBoardId;
  const b = userBoards.find((x) => x.id === boardId) || { name: 'este tablero' };
  showCustomConfirm('🗑️', '¿Eliminar "' + b.name + '"?', '¿Estás seguro de que quieres eliminar este tablero?', 'Sí, continuar', false, function() {
    showCustomConfirm('⚠️', 'Espera...', 'Si eliminas este tablero se borrará TODO su historial, transacciones, categorías y configuración para siempre. Esta acción no se puede deshacer. ¿Borrar de todas formas?', 'Sí, borrar', true, function() {
      ejecutarEliminacionDeTablero(boardId);
    });
  });
};

function ejecutarEliminacionDeTablero(boardId) {
  getTableroDocRef(boardId).delete().then(() => {
    return getUsuarioDocRef(currentUid).get();
  }).then((uDoc) => {
    let boardIds = (uDoc.exists && uDoc.data().boardIds) ? uDoc.data().boardIds : [];
    boardIds = boardIds.filter((id) => id !== boardId);
    const activeActual = uDoc.exists ? uDoc.data().activeBoardId : null;
    const nuevoActivo = (boardId === currentBoardId) ? (boardIds[0] || null) : activeActual;
    return getUsuarioDocRef(currentUid).set({ boardIds: boardIds, activeBoardId: nuevoActivo }, { merge: true }).then(() => nuevoActivo);
  }).then((nuevoActivo) => {
    closeCustomConfirm();
    closeBoardSelector();
    closeAccountInfo();
    if (boardId === currentBoardId) {
      currentBoardId = nuevoActivo;
      if (currentBoardId) {
        escucharTableroActivo(currentBoardId);
      } else {
        // El usuario se quedó sin ningún tablero: mostramos la pantalla
        // "vacía" y el selector para que cree uno nuevo.
        if (_tableroUnsubscribe) { _tableroUnsubscribe(); _tableroUnsubscribe = null; }
        transactions = [];
        allCategories.length = 0;
        JSON.parse(JSON.stringify(DEFAULT_CATEGORIES_SNAPSHOT)).forEach((c) => allCategories.push(c));
        myCards = DEFAULT_CARDS_SNAPSHOT.slice();
        const nameEl = document.getElementById('activeBoardName');
        if (nameEl) nameEl.innerText = 'Sin tableros';
        renderApp();
        openBoardSelector();
      }
    }
  }).catch((err) => console.error('❌ Error eliminando tablero:', err));
}

// ===== FASE 3: MODAL DE INFO DE CUENTA =====
window.openAccountInfo = function() {
  document.getElementById('accEmail').innerText = userEmail || (language === 'es' ? 'Sin correo' : 'No email');
  document.getElementById('accAuthMethod').innerText =
    userAuthMethod === 'google' ? 'Google Account' :
    userAuthMethod === 'apple' ? 'Apple Account' :
    userAuthMethod === 'password' ? (language === 'es' ? 'Correo y contraseña' : 'Email & password') :
    (language === 'es' ? 'Cuenta local' : 'Local account');
  document.getElementById('accountInfoModal').classList.add('open');
  renderAccountBoardList();
};
window.closeAccountInfo = function() {
  document.getElementById('accountInfoModal').classList.remove('open');
};

// ===== HELPERS GENÉRICOS DE UI: PROMPT DE TEXTO Y CONFIRMACIÓN =====
let _textPromptCallback = null;
function showTextPrompt(title, placeholder, initialValue, onSubmit) {
  document.getElementById('textPromptTitle').innerText = title;
  const input = document.getElementById('textPromptInput');
  input.placeholder = placeholder || '';
  input.value = initialValue || '';
  document.getElementById('textPromptError').innerText = '';
  _textPromptCallback = onSubmit;
  document.getElementById('textPromptModal').classList.add('open');
  setTimeout(() => input.focus(), 100);
}
window.closeTextPrompt = function() {
  document.getElementById('textPromptModal').classList.remove('open');
  _textPromptCallback = null;
};
window.submitTextPrompt = function() {
  const value = document.getElementById('textPromptInput').value;
  if (typeof _textPromptCallback === 'function') {
    const error = _textPromptCallback(value);
    if (error) document.getElementById('textPromptError').innerText = error;
  }
};

let _confirmCallback = null;
function showCustomConfirm(emoji, title, text, confirmLabel, isDanger, onConfirm) {
  document.getElementById('confirmEmoji').innerText = emoji || '⚠️';
  document.getElementById('confirmTitle').innerText = title || '¿Estás seguro?';
  document.getElementById('confirmDesc').innerText = text || '';
  const btn = document.getElementById('confirmActionBtn');
  btn.innerText = confirmLabel || 'Sí, continuar';
  btn.style.background = isDanger ? '#ff4b4b' : '#007aff';
  _confirmCallback = onConfirm;
  document.getElementById('customConfirmModal').classList.add('open');
}
window.closeCustomConfirm = function() {
  document.getElementById('customConfirmModal').classList.remove('open');
  _confirmCallback = null;
};
window.runCustomConfirmAction = function() {
  const cb = _confirmCallback;
  document.getElementById('customConfirmModal').classList.remove('open');
  _confirmCallback = null;
  if (typeof cb === 'function') cb();
};

