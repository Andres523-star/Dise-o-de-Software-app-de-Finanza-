            // ===== SISTEMA DE MONEDAS (principal + secundarias, con tasas en vivo) =====
const currencyCatalog = [
  { code: 'COP', name: 'Peso colombiano', flag: '🇨🇴' },
  { code: 'USD', name: 'Dólar estadounidense', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra esterlina', flag: '🇬🇧' },
  { code: 'MXN', name: 'Peso mexicano', flag: '🇲🇽' },
  { code: 'BRL', name: 'Real brasileño', flag: '🇧🇷' },
  { code: 'ARS', name: 'Peso argentino', flag: '🇦🇷' },
  { code: 'CLP', name: 'Peso chileno', flag: '🇨🇱' },
  { code: 'PEN', name: 'Sol peruano', flag: '🇵🇪' },
  { code: 'UYU', name: 'Peso uruguayo', flag: '🇺🇾' },
  { code: 'CAD', name: 'Dólar canadiense', flag: '🇨🇦' },
  { code: 'CHF', name: 'Franco suizo', flag: '🇨🇭' },
  { code: 'JPY', name: 'Yen japonés', flag: '🇯🇵' },
  { code: 'CNY', name: 'Yuan chino', flag: '🇨🇳' },
  { code: 'AUD', name: 'Dólar australiano', flag: '🇦🇺' },
  { code: 'KRW', name: 'Won surcoreano', flag: '🇰🇷' }
];
function getCurrencyInfo(code) {
  return currencyCatalog.find(function(c) { return c.code === code; }) || { code: code, name: code, flag: '💱' };
}

                // --- Estado: moneda principal + lista ordenada de secundarias ---
let primaryCurrency = 'COP';
let secondaryCurrencies = ['USD'];
try {
  var storedPrimary = localStorage.getItem('primaryCurrency_v1');
  var storedSecondaries = localStorage.getItem('secondaryCurrencies_v1');
  if (storedPrimary) {
    primaryCurrency = storedPrimary;
    if (storedSecondaries) secondaryCurrencies = JSON.parse(storedSecondaries);
  } else {
    // migración desde el sistema viejo (isUSD true/false)
    var oldIsUSD = localStorage.getItem('isUSD_v29');
    if (oldIsUSD === 'true') primaryCurrency = 'USD';
  }
} catch(e) {}

function saveCurrencySettings() {
  localStorage.setItem('primaryCurrency_v1', primaryCurrency);
  localStorage.setItem('secondaryCurrencies_v1', JSON.stringify(secondaryCurrencies));
  isUSD = (primaryCurrency === 'USD'); // se mantiene solo por compatibilidad con backups/Firebase viejos
  localStorage.setItem('isUSD_v29', String(isUSD));
}

              // --- Tasas de cambio en vivo (base COP), desde open.er-api.com (gratis, sin API key) ---
let currencyRates = { COP: 1 };
try {
  var storedRates = localStorage.getItem('currencyRates_v1');
  if (storedRates) currencyRates = JSON.parse(storedRates);
} catch(e) { currencyRates = { COP: 1 }; }

//  TRM: actualiza las tasas de cambio (cada 12 horas)
function updateCurrencyRates(force) {
  var lastUpdate = parseInt(localStorage.getItem('currencyRatesUpdatedAt_v1') || '0', 10);
  if (!force && (Date.now() - lastUpdate) < 12 * 60 * 60 * 1000) return Promise.resolve(currencyRates);
  // TRM: AQUÍ SE CONECTA con la API de divisas
  return fetch('https://open.er-api.com/v6/latest/COP')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.result === 'success' && data.rates) {
        currencyRates = data.rates;
        currencyRates.COP = 1;
        localStorage.setItem('currencyRates_v1', JSON.stringify(currencyRates));
        localStorage.setItem('currencyRatesUpdatedAt_v1', String(Date.now()));
        updateSecondaryCurrencyLabel();
        renderApp();
        console.log('💱 Tasas de cambio actualizadas');
      }
      return currencyRates;
    })
    .catch(function(err) {
      console.warn('⚠️ No se pudieron actualizar las tasas de cambio, se usan las guardadas:', err);
      return currencyRates;
    });
}
window.updateCurrencyRates = updateCurrencyRates;

// Convierte un monto en COP a la moneda "code" con la última tasa conocida.
// Si todavía no hay tasa para esa moneda (recién agregada, sin internet la
// primera vez), se muestra igual que COP en vez de romper la pantalla.
function convertCOP(amountCOP, code) {
  if (!code || code === 'COP') return amountCOP;
  var rate = currencyRates[code];
  if (!rate) return amountCOP;
  return amountCOP * rate;
}

// La inversa: un monto YA escrito en "code" (lo que el usuario tecleó, ej.
// 35 USD) a COP para guardarlo. Antes esto se hacía con la variable vieja
// `exchangeRate` (fija, nunca se actualizaba con la tasa en vivo) — esa era
// la causa de que $35 se convirtiera con la TRM de hace días en vez de la
// de ahorita, y de que EUR/GBP no se convirtieran para nada.
function convertToCOP(amountInCurrency, code) {
  if (!code || code === 'COP') return amountInCurrency;
  var rate = currencyRates[code];
  if (!rate) return amountInCurrency;
  return amountInCurrency / rate;
}

// Formatea un número que está guardado en la MONEDA PROPIA de una categoría
// (ej. el target de una meta, fijado en USD) para mostrarlo en la moneda
// principal de la app. formatMoney() solo sirve para montos que YA están en
// COP — pasarle un target en USD directo (como pasaba antes) da resultados
// absurdos como 0.08 o 250 sin convertir. Esto hace bien los dos pasos:
// moneda de la categoría → COP → moneda principal.
function formatMoneyFromCategoryCurrency(amount, catId) {
  // Si el valor original NO nacio en COP (ej. una meta fijada en USD), se
  // conservan SIEMPRE sus decimales exactos, sin importar en que moneda se
  // este mostrando ahora. Solo se redondea a pesos enteros cuando el valor
  // original YA estaba en COP.
  var catCurrency = categoryCurrencies[catId] || 'COP';
  var amountCOP = convertToCOP(amount, catCurrency);
  var amountPrimary = convertCOP(amountCOP, primaryCurrency);
  if (catCurrency === 'COP') {
    var decimalsCOP = primaryCurrency === 'COP' ? 0 : 2;
    return amountPrimary.toLocaleString('en-US', { maximumFractionDigits: decimalsCOP, minimumFractionDigits: decimalsCOP });
  }
  return amountPrimary.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

// Arma las <option> de un <select> de moneda usando SOLO las monedas que
// el usuario configuró (principal + secundarias) en vez de una lista fija.
function buildCurrencyOptionsHtml(selectedCode) {
  var codes = [primaryCurrency].concat(secondaryCurrencies);
  if (selectedCode && codes.indexOf(selectedCode) === -1) codes.push(selectedCode);
  return codes.map(function(code) {
    var info = getCurrencyInfo(code);
    return '<option value="' + code + '" ' + (code === selectedCode ? 'selected' : '') + '>' + info.flag + ' ' + code + '</option>';
  }).join('');
}

// rateFromCOP = cuántas unidades de "code" equivalen a 1 COP (formato crudo
// de la API). La gente lee el TRM al revés (cuántos COP por 1 dólar), así
// que acá se invierte para mostrarlo como todos lo conocen.
function formatExchangeRate(rateFromCOP) {
  if (!rateFromCOP) return '...';
  return Math.round(1 / rateFromCOP).toLocaleString('en-US');
}

// ===== MODAL: SELECTOR DE MONEDAS =====
function openCurrencySelector() {
  renderCurrencyModal();
  document.getElementById('currencyModal').classList.add('open');
  updateCurrencyRates();
}
window.openCurrencySelector = openCurrencySelector;

function closeCurrencySelector() {
  document.getElementById('currencyModal').classList.remove('open');
}
window.closeCurrencySelector = closeCurrencySelector;

function filterCurrencies() {
  renderCurrencyModal();
}
window.filterCurrencies = filterCurrencies;

// Construye una fila de moneda secundaria. El ☰ solo aparece si hay 2+
// secundarias (con 1 sola no hay nada que reordenar).
function buildSecondaryCurrencyRow(code, containerId) {
  var info = getCurrencyInfo(code);
  var canMove = secondaryCurrencies.length > 1;
  return '<div class="language-item" data-drag-id="' + code + '">' +
            (canMove ? '<span class="currency-handle" onpointerdown="cxHandleDown(event,\'' + code + '\',\'' + containerId + '\',reorderSecondaryCurrency)">☰</span>' : '') +
            '<span style="flex:1;">' + info.flag + ' ' + info.name + ' (' + info.code + ')</span>' +
            '<span class="currency-dots" onclick="openSecondaryCurrencyMenu(\'' + code + '\')">•••</span>' +
          '</div>';
}

function renderCurrencyModal() {
  var container = document.getElementById('currencyModalBody');
  if (!container) return;
  var query = normalizeSearchText(document.getElementById('currencySearchInput') ? document.getElementById('currencySearchInput').value : '');
  var html = '';

  var primInfo = getCurrencyInfo(primaryCurrency);
  var canRemovePrimary = secondaryCurrencies.length > 0;
  html += '<div class="currency-section-label">Moneda principal</div>';
  html += '<div class="language-item">' +
            '<span>' + primInfo.flag + ' ' + primInfo.name + ' (' + primInfo.code + ')</span>' +
            (canRemovePrimary
              ? '<span class="currency-dots" onclick="openPrimaryCurrencyMenu()">•••</span>'
              : '<span class="currency-change-btn" onclick="openCurrencyReplacePicker()">Cambiar</span>') +
          '</div>';

  html += '<div class="currency-section-label">Monedas secundarias</div>';
  if (secondaryCurrencies.length === 0) {
    html += '<div style="color:#c2c2c2; font-size:13px; padding:6px 4px;">No tienes ninguna todavía</div>';
  }
  secondaryCurrencies.forEach(function(code) {
    html += buildSecondaryCurrencyRow(code, 'currencyModalBody');
  });

  html += '<div class="currency-section-label">Otras</div>';
  var added = [primaryCurrency].concat(secondaryCurrencies);
  var others = currencyCatalog.filter(function(c) {
    return added.indexOf(c.code) === -1 && (normalizeSearchText(c.name).indexOf(query) !== -1 || c.code.toLowerCase().indexOf(query) !== -1);
  });
  others.sort(function(a, b) { return a.name.localeCompare(b.name); });
  others.forEach(function(c) {
    html += '<div class="language-item" onclick="showCurrencyAddChoice(\'' + c.code + '\')">' +
              '<span>' + c.flag + ' ' + c.name + ' (' + c.code + ')</span>' +
            '</div>';
  });

  container.innerHTML = html;
}
window.renderCurrencyModal = renderCurrencyModal;

// ===== MANTENER PRESIONADO 0.5s + ARRASTRAR PARA REORDENAR =====
// Con drag nativo del navegador casi nunca responde bien al dedo en
// celular. Este usa Pointer Events (funcionan igual con mouse y con
// touch): mantener presionado el ☰ 0.5s activa el modo arrastre (la fila
// se pone azul), y al mover el dedo se resalta en azul la posición donde
// quedaría si sueltas ahí. Genérico: sirve para monedas, tableros o
// cualquier lista futura — cada fila lleva un atributo data-drag-id y un
// callback distinto según qué se está reordenando.
let _cxLongPressTimer = null;
let _cxDragging = false;
let _cxDragId = null;
let _cxDragContainerId = null;
let _cxDragCallback = null;

function cxHandleDown(ev, dragId, containerId, callback, delayMs) {
  ev.preventDefault();
  clearTimeout(_cxLongPressTimer);
  _cxDragId = dragId;
  _cxDragContainerId = containerId;
  _cxDragCallback = callback;
  _cxLongPressTimer = setTimeout(function() {
    _cxDragging = true;
    var row = cxRowEl(dragId, containerId);
    if (row) row.classList.add('currency-row-active');
    if (navigator.vibrate) navigator.vibrate(15);
  }, delayMs || 500);
  document.addEventListener('pointermove', cxHandleMove);
  document.addEventListener('pointerup', cxHandleUp);
  document.addEventListener('pointercancel', cxHandleUp);
}
window.cxHandleDown = cxHandleDown;
document.addEventListener('touchmove', function(e) { if (_cxDragging) e.preventDefault(); }, { passive: false });

function cxRowEl(dragId, containerId) {
  var container = document.getElementById(containerId);
  return container ? container.querySelector('[data-drag-id="' + dragId + '"]') : null;
}

function cxHandleMove(ev) {
  if (!_cxDragging) {
    // Si el dedo se movió antes de cumplir los 0.5s, se cancela: era un
    // scroll normal, no la intención de arrastrar.
    clearTimeout(_cxLongPressTimer);
    return;
  }
  var container = document.getElementById(_cxDragContainerId);
  if (!container) return;
  var rows = Array.prototype.slice.call(container.querySelectorAll('[data-drag-id]'));
  rows.forEach(function(r) { r.classList.remove('currency-row-target'); });
  var y = ev.clientY;
  rows.forEach(function(r) {
    var rect = r.getBoundingClientRect();
    if (y >= rect.top && y <= rect.bottom) r.classList.add('currency-row-target');
  });
}

function cxHandleUp() {
  clearTimeout(_cxLongPressTimer);
  document.removeEventListener('pointermove', cxHandleMove);
  document.removeEventListener('pointerup', cxHandleUp);
  document.removeEventListener('pointercancel', cxHandleUp);

  if (_cxDragging) {
    window._cxJustDragged = true;
    setTimeout(function() { window._cxJustDragged = false; }, 350);
    var container = document.getElementById(_cxDragContainerId);
    var targetRow = container ? container.querySelector('.currency-row-target') : null;
    if (targetRow && _cxDragCallback) {
      _cxDragCallback(_cxDragId, targetRow.dataset.dragId);
    }
  }
  document.querySelectorAll('.currency-row-active, .currency-row-target').forEach(function(el) {
    el.classList.remove('currency-row-active', 'currency-row-target');
  });
  _cxDragging = false;
  _cxDragId = null;
  _cxDragContainerId = null;
  _cxDragCallback = null;
}

function reorderSecondaryCurrency(fromCode, toCode) {
  if (fromCode === toCode) return;
  var fromIdx = secondaryCurrencies.indexOf(fromCode);
  var toIdx = secondaryCurrencies.indexOf(toCode);
  if (fromIdx === -1 || toIdx === -1) return;
  secondaryCurrencies.splice(fromIdx, 1);
  secondaryCurrencies.splice(toIdx, 0, fromCode);
  saveCurrencySettings();
  renderCurrencyModal();
  var rateModal = document.getElementById('exchangeRateModal');
  if (rateModal && rateModal.classList.contains('open')) renderExchangeRateList();
  updateSecondaryCurrencyLabel();
  scheduleGuardarEnFirebase();
}
window.reorderSecondaryCurrency = reorderSecondaryCurrency;

// ===== RECALCULAR TRANSACCIONES VIEJAS CON LA TRM ACTUAL =====
// Antes del arreglo, cualquier transacción guardada en otra moneda (ej. USD)
// se convertía a COP con una tasa vieja y fija que nunca se actualizaba. Esas
// transacciones YA quedaron mal guardadas en COP para siempre — el arreglo
// del código solo corrige las transacciones NUEVAS, no las viejas. Esto
// recalcula, una sola vez, el valor en COP de cada transacción vieja usando
// su monto y moneda originales (t.origAmount / t.origCurrency) contra la
// tasa de cambio de HOY. Las transacciones que ya estaban en COP no se tocan.
function recalcularTransaccionesConTasaActual() {
  var candidatas = transactions.filter(function(t) {
    return t.origCurrency && t.origCurrency !== 'COP' && t.origAmount !== undefined && t.origAmount !== null;
  });
  if (candidatas.length === 0) {
    showCustomAlert('ℹ️', 'Nada que recalcular', 'No tienes transacciones guardadas en otra moneda distinta a COP.', 'warning');
    return;
  }
  if (!confirm('Esto va a recalcular el valor en pesos de ' + candidatas.length + ' transacción(es) que se guardaron en otra moneda, usando la TRM de HOY. Las que ya están en COP no cambian. ¿Continuar?')) return;

  updateCurrencyRates(true).then(function() {
    var actualizadas = 0;
    candidatas.forEach(function(t) {
      var nuevoAmount = convertToCOP(t.origAmount, t.origCurrency);
      if (Math.abs(nuevoAmount - t.amount) > 1) {
        t.amount = nuevoAmount;
        actualizadas++;
      }
    });
    renderApp();
    scheduleGuardarEnFirebase();
    showCustomAlert('✅', '¡Listo!', actualizadas + ' de ' + candidatas.length + ' transacciones se actualizaron con la TRM de hoy.', 'success');
  });
}
window.recalcularTransaccionesConTasaActual = recalcularTransaccionesConTasaActual;

// ===== MENÚ QUE ABREN LOS ⋯ (nunca borran directo) =====
function openPrimaryCurrencyMenu() {
  if (secondaryCurrencies.length === 0) { openCurrencyReplacePicker(); return; }
  var info = getCurrencyInfo(primaryCurrency);
  showCurrencyRowMenu(info.flag + ' ' + info.name + ' (' + info.code + ')', [
    { label: 'Reemplazar', style: 'primary', action: openCurrencyReplacePicker },
    { label: 'Eliminar', style: 'danger', action: removePrimaryCurrency }
  ]);
}
window.openPrimaryCurrencyMenu = openPrimaryCurrencyMenu;

function openSecondaryCurrencyMenu(code) {
  var info = getCurrencyInfo(code);
  showCurrencyRowMenu(info.flag + ' ' + info.name + ' (' + info.code + ')', [
    { label: 'Eliminar', style: 'danger', action: function() { removeSecondaryCurrency(code); } }
  ]);
}
window.openSecondaryCurrencyMenu = openSecondaryCurrencyMenu;

function showCurrencyRowMenu(label, options) {
  document.getElementById('currencyRowMenuLabel').innerText = label;
  var box = document.getElementById('currencyRowMenuButtons');
  box.innerHTML = '';
  options.forEach(function(opt) {
    var bg = opt.style === 'danger' ? '#ffecec; color:#ff4b4b;' : '#007aff; color:#fff;';
    var btn = document.createElement('button');
    btn.className = 'close-modal';
    btn.style.cssText = 'position:static; width:100%; background:' + bg + ' border-radius:12px; padding:12px; font-weight:700;';
    btn.innerText = opt.label;
    btn.onclick = function() { closeCurrencyRowMenu(); opt.action(); };
    box.appendChild(btn);
  });
  document.getElementById('currencyRowMenu').classList.add('open');
}

function closeCurrencyRowMenu() {
  document.getElementById('currencyRowMenu').classList.remove('open');
}
window.closeCurrencyRowMenu = closeCurrencyRowMenu;

function removePrimaryCurrency() {
  if (secondaryCurrencies.length === 0) return;
  primaryCurrency = secondaryCurrencies.shift();
  saveCurrencySettings();
  document.getElementById('settingsPrimaryCurrency').innerText = primaryCurrency;
  renderCurrencyModal();
  updateSecondaryCurrencyLabel();
  renderApp();
  scheduleGuardarEnFirebase();
}
window.removePrimaryCurrency = removePrimaryCurrency;

function removeSecondaryCurrency(code) {
  // Ya no es obligatorio tener alguna secundaria: se puede llegar a cero.
  secondaryCurrencies = secondaryCurrencies.filter(function(c) { return c !== code; });
  saveCurrencySettings();
  renderCurrencyModal();
  updateSecondaryCurrencyLabel();
  scheduleGuardarEnFirebase();
}
window.removeSecondaryCurrency = removeSecondaryCurrency;

// ===== PICKER: elegir la nueva moneda principal ("Reemplazar" / "Cambiar") =====
function openCurrencyReplacePicker() {
  renderCurrencyReplaceList();
  document.getElementById('currencyReplaceModal').classList.add('open');
}
window.openCurrencyReplacePicker = openCurrencyReplacePicker;

function closeCurrencyReplaceModal() {
  document.getElementById('currencyReplaceModal').classList.remove('open');
}
window.closeCurrencyReplaceModal = closeCurrencyReplaceModal;

function renderCurrencyReplaceList() {
  var list = document.getElementById('currencyReplaceList');
  var query = normalizeSearchText(document.getElementById('currencyReplaceSearchInput') ? document.getElementById('currencyReplaceSearchInput').value : '');
  var options = currencyCatalog.filter(function(c) {
    return c.code !== primaryCurrency && (normalizeSearchText(c.name).indexOf(query) !== -1 || c.code.toLowerCase().indexOf(query) !== -1);
  });
  options.sort(function(a, b) { return a.name.localeCompare(b.name); });
  list.innerHTML = '';
  options.forEach(function(c) {
    var item = document.createElement('div');
    item.className = 'language-item';
    item.innerHTML = '<span>' + c.flag + ' ' + c.name + ' (' + c.code + ')</span>';
    item.onclick = function() { pickNewPrimaryCurrency(c.code); };
    list.appendChild(item);
  });
}
window.renderCurrencyReplaceList = renderCurrencyReplaceList;

function pickNewPrimaryCurrency(code) {
  if (secondaryCurrencies.indexOf(primaryCurrency) === -1) secondaryCurrencies.push(primaryCurrency);
  secondaryCurrencies = secondaryCurrencies.filter(function(c) { return c !== code; });
  primaryCurrency = code;
  saveCurrencySettings();
  document.getElementById('settingsPrimaryCurrency').innerText = primaryCurrency;
  closeCurrencyReplaceModal();
  renderCurrencyModal();
  updateSecondaryCurrencyLabel();
  renderApp();
  scheduleGuardarEnFirebase();
  updateCurrencyRates();
}
window.pickNewPrimaryCurrency = pickNewPrimaryCurrency;

function showCurrencyAddChoice(code) {
  var info = getCurrencyInfo(code);
  var box = document.getElementById('currencyAddChoiceBox');
  document.getElementById('currencyAddChoiceLabel').innerText = info.flag + ' ' + info.name + ' (' + info.code + ')';
  box.dataset.code = info.code;
  box.classList.add('open');
}
window.showCurrencyAddChoice = showCurrencyAddChoice;

function closeCurrencyAddChoice() {
  document.getElementById('currencyAddChoiceBox').classList.remove('open');
}
window.closeCurrencyAddChoice = closeCurrencyAddChoice;

function confirmAddCurrency(kind) {
  var box = document.getElementById('currencyAddChoiceBox');
  var code = box.dataset.code;
  if (!code) return;
  if (kind === 'primary') {
    if (secondaryCurrencies.indexOf(primaryCurrency) === -1) secondaryCurrencies.unshift(primaryCurrency);
    primaryCurrency = code;
    secondaryCurrencies = secondaryCurrencies.filter(function(c) { return c !== code; });
    document.getElementById('settingsPrimaryCurrency').innerText = primaryCurrency;
  } else {
    if (secondaryCurrencies.indexOf(code) === -1) secondaryCurrencies.push(code);
  }
  saveCurrencySettings();
  closeCurrencyAddChoice();
  renderCurrencyModal();
  updateSecondaryCurrencyLabel();
  renderApp();
  scheduleGuardarEnFirebase();
  updateCurrencyRates();
}
window.confirmAddCurrency = confirmAddCurrency;

// ===== FILA/BOTÓN DE TRM (antes texto fijo, ahora clicable) =====
function updateSecondaryCurrencyLabel() {
  var el = document.getElementById('settingsSecondaryCurrency');
  if (!el) return;
  if (secondaryCurrencies.length === 0) { el.innerText = '—'; return; }
  var first = secondaryCurrencies[0];
  var rate = currencyRates[first];
  el.innerText = first + ' ($' + formatExchangeRate(rate) + ' TRM)';
}
window.updateSecondaryCurrencyLabel = updateSecondaryCurrencyLabel;

function openExchangeRateButton() {
  if (secondaryCurrencies.length <= 1) return; // con una sola secundaria no hace falta abrir nada, ya se ve todo en la fila
  renderExchangeRateList();
  document.getElementById('exchangeRateModal').classList.add('open');
}
window.openExchangeRateButton = openExchangeRateButton;

function closeExchangeRateList() {
  document.getElementById('exchangeRateModal').classList.remove('open');
}
window.closeExchangeRateList = closeExchangeRateList;

function renderExchangeRateList() {
  var list = document.getElementById('exchangeRateList');
  var canMove = secondaryCurrencies.length > 1;
  var html = '';
  secondaryCurrencies.forEach(function(code) {
    var info = getCurrencyInfo(code);
    var rate = currencyRates[code];
    html += '<div class="language-item" data-drag-id="' + code + '">' +
              (canMove ? '<span class="currency-handle" onpointerdown="cxHandleDown(event,\'' + code + '\',\'exchangeRateList\',reorderSecondaryCurrency)">☰</span>' : '') +
              '<div style="flex:1;">' +
                '<div>' + info.flag + ' ' + info.name + ' (' + code + ')</div>' +
                '<div style="font-size:12px; color:#8a8a8a; font-weight:600; margin-top:2px;">$' + formatExchangeRate(rate) + ' TRM</div>' +
              '</div>' +
            '</div>';
  });
  list.innerHTML = html;
}

// --- El tap rápido sobre el balance principal (mainBalanceClick) sigue

// existiendo: intercambia la principal con la primera secundaria. ---
function toggleCurrency() {
  if (secondaryCurrencies.length === 0) return;
  var other = secondaryCurrencies[0];
  secondaryCurrencies[0] = primaryCurrency;
  primaryCurrency = other;
  saveCurrencySettings();
  var settingsLabel = document.getElementById('settingsPrimaryCurrency');
  if (settingsLabel) settingsLabel.innerText = primaryCurrency;
  var mainLabel = document.getElementById('mainCurrencyLabel');
  if (mainLabel) mainLabel.innerText = primaryCurrency;
  updateSecondaryCurrencyLabel();
  renderApp();
  scheduleGuardarEnFirebase();
}

