// ================================================================
// ===== SWIPE HORIZONTAL entre pantallas emparentadas =====
// Alcance (segun lo permitido si es demasiado complejo cubrir todas las
// parejas): Nueva <-> Editar tarjeta, y Comprar <-> Vender en Recomendacion.
// ================================================================
function recoSwipeAttach(modalId, alSwipear, hayTextoSinGuardarFn) {
  var el = document.getElementById(modalId);
  if (!el) return;
  var startX = 0, startY = 0, activo = false;
  el.addEventListener('touchstart', function(e) {
    if (!e.touches || e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    activo = true;
  }, { passive: true });
  el.addEventListener('touchend', function(e) {
    if (!activo) return;
    activo = false;
    var t = (e.changedTouches && e.changedTouches[0]) || null;
    if (!t) return;
    var deltaX = t.clientX - startX;
    var deltaY = t.clientY - startY;
    if (Math.abs(deltaX) < 80 || Math.abs(deltaY) > 40) return; // no fue un swipe horizontal claro
    if (hayTextoSinGuardarFn && hayTextoSinGuardarFn()) return; // hay texto sin guardar, no navegar
    var direccion = deltaX < 0 ? 'left' : 'right';
    var content = el.querySelector('.modal-content');
    if (!content) { alSwipear(direccion); return; }
    // Primero se ve la pantalla actual deslizarse hacia afuera, y SOLO
    // despues se hace el cambio real (cerrar/abrir modal o cambiar pestaña),
    // para que la animacion sea visible antes del salto.
    content.classList.add(direccion === 'left' ? 'swipe-out-left' : 'swipe-out-right');
    setTimeout(function() {
      content.classList.remove('swipe-out-left', 'swipe-out-right');
      alSwipear(direccion);
      var nuevoContent = document.querySelector('.modal-overlay.open .modal-content');
      if (nuevoContent) {
        nuevoContent.classList.add(direccion === 'left' ? 'swipe-in-left' : 'swipe-in-right');
        setTimeout(function() { nuevoContent.classList.remove('swipe-in-left', 'swipe-in-right'); }, 220);
      }
    }, 180);
  }, { passive: true });
}

// --- Pareja: Nueva tarjeta <-> Editar tarjeta ---
function recoEditCardNombreCambiado() {
  var input = document.getElementById('editCardNameInput');
  return !!(input && typeof editingCardOldName !== 'undefined' && editingCardOldName && input.value !== editingCardOldName);
}
function recoNewCardTieneTexto() {
  var input = document.getElementById('wizardCardName');
  return !!(input && input.value && input.value.trim().length > 0);
}
recoSwipeAttach('editCardModal', function() {
  closeEditCardModal();
  openNewCardWizard();
}, recoEditCardNombreCambiado);
recoSwipeAttach('newCardWizardModal', function() {
  // Solo hay "pareja" si veniamos de editar una tarjeta especifica.
  if (typeof editingCardOldName !== 'undefined' && editingCardOldName) {
    closeNewCardWizard();
    openEditCardModal(editingCardOldName);
  }
}, recoNewCardTieneTexto);

// --- Pareja: pestañas Comprar <-> Vender de Recomendación ---
recoSwipeAttach('recoModal', function(direccion) {
  if (direccion === 'left' && recoMode === 'buy') recoSetTab('sell');
  else if (direccion === 'right' && recoMode === 'sell') recoSetTab('buy');
}, function() {
  // Bloquea el swipe si hay un monto escrito sin "confirmar" a medias
  // (evita perder lo que la persona esta escribiendo en el input de monto).
  var input = document.getElementById('recoAmountInput');
  return false; // el monto se conserva al cambiar de pestaña, no hay riesgo de perderlo
});

// ================================================================
// ===== GO PRO (solo visual por ahora, sin pagos reales) =====
// ================================================================
let goProPlanSeleccionado = 'yearly';

window.openGoPro = function() {
  closeSettings();
  goProPlanSeleccionado = 'yearly';
  var yearlyCard = document.getElementById('goProCardYearly');
  var monthlyCard = document.getElementById('goProCardMonthly');
  if (yearlyCard) yearlyCard.classList.add('gopro-selected');
  if (monthlyCard) monthlyCard.classList.remove('gopro-selected');
  document.getElementById('goProModal').classList.add('open');
};
window.closeGoPro = function() {
  document.getElementById('goProModal').classList.remove('open');
  openSettings();
};
window.selectGoProPlan = function(plan) {
  goProPlanSeleccionado = plan;
  document.getElementById('goProCardYearly').classList.toggle('gopro-selected', plan === 'yearly');
  document.getElementById('goProCardMonthly').classList.toggle('gopro-selected', plan === 'monthly');
};
window.continuarGoPro = function() {
  var es = language === 'es';
  showCustomAlert('🚧', es ? 'Próximamente' : 'Coming soon',
    es ? 'Estamos configurando el sistema de pagos.' : "We're setting up the payment system.");
};
window.goProPrivacidad = function() {
  var es = language === 'es';
  showCustomAlert('🔒', es ? 'Privacidad' : 'Privacy', es ? 'Próximamente encontrarás aquí la política de privacidad.' : "The privacy policy will be available here soon.");
};
window.goProRestaurar = function() {
  var es = language === 'es';
  showCustomAlert('🔄', es ? 'Restaurar compras' : 'Restore purchases', es ? 'Todavía no hay compras que restaurar: Go Pro está por lanzarse.' : "There's nothing to restore yet: Go Pro is coming soon.");
};
window.goProContacto = function() {
  var es = language === 'es';
  showCustomAlert('✉️', es ? 'Contacto' : 'Contact', es ? 'Escríbenos pronto desde aquí. Estamos ultimando los detalles.' : "You'll be able to reach us from here soon.");
};

// ================================================================
// ===== MENSAJES / PAGOS PENDIENTES (estilo Nequi) =====
// ================================================================

let pendingMessages = [];
let pendingAcceptData = null;

try {
  const stored = localStorage.getItem('pendingMessages_v1');
  if (stored) pendingMessages = JSON.parse(stored);
} catch(e) { pendingMessages = []; }

function savePendingMessages() {
  localStorage.setItem('pendingMessages_v1', JSON.stringify(pendingMessages));
}

function parseQRPaymentEmail(text) {
  const lower = text.toLowerCase();
  const result = { amount: null, currency: 'COP', merchant: null, category: null, date: new Date(), raw: text };

  // Patrones para bancos colombianos
  const patterns = [
    // Nequi: "Recibiste $50.000 de Juan Pérez" o "Pago recibido $50.000 COP"
    { regex: /recibiste\s+\$?([\d.,]+)\s*(?:cop|pesos)?\s*(?:de|from)\s+([^\n.]+)/i, bank: 'nequi' },
    { regex: /pago recibido\s+\$?([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'nequi' },
    { regex: /nequi.*?\$?([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'nequi' },

    // Daviplata: "Recibiste $50.000" "Transferencia recibida"
    { regex: /daviplata.*?\$?([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'daviplata' },
    { regex: /transferencia recibida\s+\$?([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'daviplata' },

    // Bancolombia: "Abono por $50.000" "Transferencia exitosa"
    { regex: /bancolombia.*?\$?([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'bancolombia' },
    { regex: /abono por\s+\$?([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'bancolombia' },

    // BBVA: "Recibiste $50.000"
    { regex: /bbva.*?\$?([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'bbva' },

    // Genérico: busca montos con $ o COP
    { regex: /\$([\d.,]+)\s*(?:cop|pesos)?/i, bank: 'generic' },
    { regex: /([\d.,]+)\s*cop/i, bank: 'generic' },
  ];

  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match) {
      const amountStr = match[1].replace(/[.,]/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        result.amount = amount;
        if (match[2]) result.merchant = match[2].trim();
        break;
      }
    }
  }

  // Detectar moneda
  if (lower.includes('usd') || lower.includes('dólar') || lower.includes('dolar') || lower.includes('$') && !lower.includes('cop')) {
    if (!lower.includes('cop') && !lower.includes('pesos')) result.currency = 'USD';
  }
  if (lower.includes('eur') || lower.includes('euro')) result.currency = 'EUR';

  // Categorizar por palabras clave en el texto
  const categoryKeywords = {
    'exp_food': ['restaurante', 'restaurant', 'comida', 'food', 'almuerzo', 'cena', 'desayuno', 'café', 'cafe', 'coffee', 'hamburguesa', 'pizza', 'sushi'],
    'exp_transport': ['uber', 'taxi', 'transporte', 'transport', 'gasolina', 'gas', 'bus', 'metro', 'peaje'],
    'exp_shop': ['tienda', 'store', 'shop', 'supermercado', 'supermarket', 'mercado', 'droguería', 'farmacia'],
    'exp_sub': ['netflix', 'spotify', 'suscripción', 'suscripcion', 'subscription', 'prime', 'disney', 'hbo', 'icloud', 'google one'],
    'exp_entertainment': ['cine', 'movie', 'teatro', 'concierto', 'evento', 'juego', 'game'],
    'exp_clothes': ['ropa', 'clothes', 'zapatos', 'shoes', 'camisa', 'pantalón', 'vestido'],
    'exp_lux': ['joya', 'reloj', 'watch', 'bolso', 'cartera', 'perfume'],
  };

  for (const [catId, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      result.category = catId;
      break;
    }
  }
  if (!result.category) result.category = 'exp_shop'; // default

  // Si no hay merchant, intentar extraerlo
  if (!result.merchant) {
    const merchantMatch = text.match(/(?:de|from|por)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,30})/);
    if (merchantMatch) result.merchant = merchantMatch[1].trim();
  }

  return result;
}

window.openMessagesModal = function() {
  renderMessagesList();
  document.getElementById('messagesModal').classList.add('open');
};

window.closeMessagesModal = function() {
  document.getElementById('messagesModal').classList.remove('open');
  document.getElementById('pasteEmailText').value = '';
};

function getCategoryName(catId) {
  const cat = allCategories.find(c => c.id === catId);
  return cat ? cat.name : catId;
}

// ================================================================
// ===== NOTIFICACIONES (campanita arriba) =====
// ================================================================

let notifications = [];

try {
  const stored = localStorage.getItem('notifications_v1');
  if (stored) notifications = JSON.parse(stored);
} catch(e) { notifications = []; }

function saveNotifications() {
  localStorage.setItem('notifications_v1', JSON.stringify(notifications));
}

function updateNotificationsBadge() {
  const badge = document.getElementById('notificationsBadge');
  if (badge) {
    if (notifications.length > 0) {
      badge.style.display = 'flex';
      badge.innerText = notifications.length > 9 ? '9+' : notifications.length;
    } else {
      badge.style.display = 'none';
    }
  }
}

window.openNotificationsModal = function() {
  renderNotificationsList();
  document.getElementById('notificationsModal').classList.add('open');
};

window.closeNotificationsModal = function() {
  document.getElementById('notificationsModal').classList.remove('open');
};

function renderNotificationsList() {
  const list = document.getElementById('notificationsList');
  const empty = document.getElementById('notificationsEmpty');
  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  updateNotificationsBadge();

  list.innerHTML = notifications.map((notif, idx) => `
    <div class="message-item" style="background:#fff; border-radius:16px; padding:16px; border:1px solid #eaeaea; position:relative;">
      <div style="display:flex; align-items:flex-start; gap:12px;">
        <div style="font-size:28px;">${notif.bank === 'nequi' ? '💜' : notif.bank === 'daviplata' ? '💚' : notif.bank === 'bancolombia' ? '💛' : '💳'}</div>
        <div style="flex:1;">
          <div style="font-weight:800; font-size:16px;">${notif.merchant || (language === 'es' ? 'Pago recibido' : 'Payment received')}</div>
          <div style="font-size:13px; color:#8a8a8a; margin-top:2px;">${notif.bank} • ${notif.date.toLocaleString()}</div>
          <div style="margin-top:8px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-weight:800; font-size:18px; color:#ff4b4b;">-${formatMoney(notif.amount)} ${notif.currency}</span>
            <span style="font-size:12px; background:#f0f0f0; padding:2px 8px; border-radius:10px; color:#666;">${getCategoryName(notif.category)}</span>
          </div>
        </div>
      </div>
      <div style="display:flex; gap:8px; margin-top:16px; padding-top:16px; border-top:1px solid #eaeaea;">
        <button class="icon-action-btn" style="flex:1; background:#ffecec; border-color:#ff4b4b; color:#ff4b4b;" onclick="rejectNotification(${idx})" data-i18n="reject">✕ Rechazar</button>
        <button class="icon-action-btn confirm" style="flex:1;" onclick="showConfirmAccept(${idx})" data-i18n="accept">✓ Aceptar</button>
      </div>
    </div>
  `).join('');
}

window.rejectNotification = function(idx) {
  notifications.splice(idx, 1);
  saveNotifications();
  renderNotificationsList();
  updateNotificationsBadge();
};

window.showConfirmAccept = function(idx) {
  pendingAcceptData = { ...notifications[idx], index: idx };
  const msg = pendingAcceptData;
  const es = language === 'es';

  document.getElementById('confirmAcceptEmoji').innerText = msg.bank === 'nequi' ? '💜' : msg.bank === 'daviplata' ? '💚' : '💳';
  document.getElementById('confirmAcceptTitle').innerText = es ? 'Confirmar pago' : 'Confirm payment';
  document.getElementById('confirmAcceptDesc').innerText = es ? '¿Agregar este gasto a tus transacciones?' : 'Add this expense to your transactions?';
  document.getElementById('confirmAcceptDetails').innerHTML = `
    <div><b>${t('payment_from')}:</b> ${msg.merchant || (es ? 'Desconocido' : 'Unknown')}</div>
    <div><b>${t('payment_amount')}:</b> ${formatMoney(msg.amount)} ${msg.currency}</div>
    <div><b>${t('payment_category')}:</b> ${getCategoryName(msg.category)}</div>
    <div><b>${t('payment_date')}:</b> ${msg.date.toLocaleDateString()}</div>
  `;
  document.getElementById('confirmAcceptModal').classList.add('open');
};

window.closeConfirmAccept = function() {
  document.getElementById('confirmAcceptModal').classList.remove('open');
  pendingAcceptData = null;
};

window.executeAcceptPayment = function() {
  if (!pendingAcceptData) return;
  const msg = pendingAcceptData;

  // Convertir a COP si es otra moneda
  let amountCOP = msg.amount;
  if (msg.currency !== 'COP') {
    const rate = currencyRates[msg.currency] || 1;
    amountCOP = msg.amount / rate;
  }

  transactions.push({
    id: Date.now(),
    month: currentMonth,
    type: 'expense',
    catId: msg.category,
    title: msg.merchant || (language === 'es' ? 'Pago QR' : 'QR Payment'),
    amount: Math.round(amountCOP),
    accStr: 'Efectivo',
    date: new Date().toLocaleDateString(language === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short' }),
    tags: [],
    origAmount: msg.amount,
    origCurrency: msg.currency
  });

  notifications.splice(pendingAcceptData.index, 1);
  saveNotifications();
  renderNotificationsList();
  updateNotificationsBadge();
  closeConfirmAccept();
  renderApp();
  scheduleGuardarEnFirebase();

  const es = language === 'es';
  showCustomAlert('✅', es ? 'Gasto agregado' : 'Expense added', es ? 'El pago se registró correctamente.' : 'Payment recorded successfully.', 'success');
};

// ================================================================
// ===== BOTÓN ! - ROLLOVER MES ANTERIOR (SIEMPRE VISIBLE 24H) =====
// ================================================================

let showBalanceResetButton = false;

function initBalanceResetTimer() {
  showBalanceResetButton = true;
  updateNegativeBalanceIcon();

  // Ocultar después de 24h
  setTimeout(() => {
    showBalanceResetButton = false;
    updateNegativeBalanceIcon();
  }, 24 * 60 * 60 * 1000);
}

function updateNegativeBalanceIcon() {
  const icon = document.getElementById('negativeBalanceIcon');
  if (!icon) return;

  const hasRollover = negativeBalanceAlert && negativeBalanceAlert.expiresAt > Date.now() && negativeBalanceAlert.month === currentMonth;
  const showIcon = hasRollover || showBalanceResetButton;
  
  icon.style.display = showIcon ? 'flex' : 'none';
  icon.innerText = '❗️'; // SIEMPRE signo de exclamación
  icon.title = language === 'es' ? 'Balance del mes anterior' : 'Previous month balance';
}

// Click en ! -> SIEMPRE abre el modal de rollover (mes anterior)
window.showRolloverInfoIcon = function() {
  openMonthRolloverModal();
};

const openMonthRolloverModal = function() {
  const es = language === 'es';
  const amount = Math.abs(pendingRolloverAmount);
  const isPositive = pendingRolloverAmount >= 0;
  
  document.getElementById('monthRolloverDesc').innerText = 
    (es ? 'Tu mes anterior cerró con un balance ' : 'Your previous month closed with a ') +
    (isPositive ? (es ? 'positivo' : 'positive') : (es ? 'negativo' : 'negative')) +
    ' de $' + formatMoney(amount) + '. ' +
    (es ? '¿Quieres empezar este mes con ese balance o desde cero?' : 'Start this month with that balance or from zero?');
  document.getElementById('monthRolloverModal').classList.add('open');
};

window.chooseRolloverOption = function(option) {
  const es = language === 'es';
  
  if (option === 'current' && pendingRolloverMonth) {
    const isPositive = pendingRolloverAmount >= 0;
    transactions.push({
      id: Date.now(),
      month: pendingRolloverMonth,
      type: isPositive ? 'income' : 'expense',
      catId: isPositive ? 'inc_carryover' : 'exp_carryover',
      title: (isPositive ? '💰' : '📉') + ' ' + (es ? 'Saldo inicial (mes anterior)' : 'Initial balance (prev month)'),
      amount: Math.abs(pendingRolloverAmount),
      accStr: 'Sistema',
      date: 'Inicio de mes',
      tags: []
    });
  }
  // option === 'zero' -> NO agrega nada = empieza en 0
  
  if (negativeBalanceAlert) {
    negativeBalanceAlert.decided = true;
    localStorage.setItem('negativeBalanceAlert_v28', JSON.stringify(negativeBalanceAlert));
  }
  document.getElementById('monthRolloverModal').classList.remove('open');
  renderApp();
  checkNegativeBalanceIconVisibility();
};

// Eliminar openBalanceResetModal y executeBalanceReset (ya no se usan)
window.openBalanceResetModal = function() {};
window.executeBalanceReset = function() {};
window.closeBalanceResetModal = function() {};

// ================================================================
// ===== VERIFICAR Y CORREGIR BALANCE EN renderApp =====
// ================================================================

// Agregar al final de renderApp la verificación de consistencia
const originalRenderApp = renderApp;
window.renderApp = function() {
  originalRenderApp();
  verifyBalanceConsistency();
};

function verifyBalanceConsistency() {
  const allTx = transactions.filter(t => t.month === currentMonth);
  let totalInc = 0, totalExp = 0, totalSav = 0;
  allTx.forEach(t => {
    if (t.type === 'income') totalInc += t.amount;
    if (t.type === 'expense') totalExp += t.amount;
    if (t.type === 'save' && t.takeFromBalance) totalSav += t.amount;
  });
  const expectedNet = totalInc - totalExp - totalSav;

  const displayedText = document.getElementById('mainBalanceVal')?.innerText || '';
  const displayedNum = parseFloat(displayedText.replace(/[.,]/g, '')) || 0;
  const signCircle = document.getElementById('mainSignCircle');
  const isNegative = signCircle?.innerText === '-';

  const actualDisplayed = isNegative ? -displayedNum : displayedNum;

  if (Math.abs(expectedNet - actualDisplayed) > 1) {
    console.warn('⚠️ Balance inconsistency detected:', { expectedNet, actualDisplayed, totalInc, totalExp, totalSav });
    // Forzar re-render para corregir
    setTimeout(() => originalRenderApp(), 0);
  }
}

// Inicializar timer de 24h al cargar
document.addEventListener('DOMContentLoaded', function() {
  initBalanceResetTimer();
  updateNegativeBalanceIcon();
});