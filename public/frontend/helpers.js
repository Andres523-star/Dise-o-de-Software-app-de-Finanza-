// ===== CONVERTIR UN MONTO EN COP A LA MONEDA DE UNA CATEGORÍA =====
// Los montos guardados en `transactions` siempre están en COP, pero una
// meta/presupuesto puede estar fijado en cualquier otra moneda. Cualquier
// comparación entre "lo ahorrado" y "la meta" TIENE que pasar por aquí, o el
// porcentaje sale inflado (ese fue el bug del 45.500%). Ahora usa las tasas
// en vivo (currencyRates) en vez de las aproximaciones fijas de antes.
const convertCOPToCategoryCurrency = function(amountCOP, catId) {
  var currency = categoryCurrencies[catId] || 'COP';
  return convertCOP(amountCOP, currency);
};

// ===== % DE AVANCE DE UNA CATEGORÍA (con conversión de moneda) =====
const getCategoryPct = function(cat) {
  var limit = cat.budget > 0 ? cat.budget : (cat.target || 0);
  if (!(limit > 0)) return 0;
  var spentCOP = getCategoryProgressTotal(cat);
  var spentEnMoneda = convertCOPToCategoryCurrency(spentCOP, cat.id);
  return Math.round((spentEnMoneda / limit) * 100);
};

const formatMoney = function(amount) {
  var finalAmt = convertCOP(amount, primaryCurrency);
  var decimals = primaryCurrency === 'COP' ? 0 : 2;
  return finalAmt.toLocaleString('en-US', { maximumFractionDigits: decimals });
};

const formatCOP = function(amount) {
  return Math.round(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const buildAmountPillHtml = function(t, prefix, colorClass) {
  if (t.origCurrency && t.origCurrency !== 'COP' && t.origCurrency !== primaryCurrency) {
    var bigOrig = Number(t.origAmount).toLocaleString('en-US', { maximumFractionDigits: 2 });
    var copConv = formatCOP(t.amount);
    return '<div class="tx-amount-pill ' + colorClass + '" style="flex-direction:column; align-items:flex-end; gap:0; padding:6px 12px;">' +
             '<span><span class="dot-sign">' + prefix + '</span> $' + bigOrig + ' ' + t.origCurrency + '</span>' +
             '<span style="font-size:10px; font-weight:600; color:#8a8a8a; opacity:0.55; margin-top:1px;">$' + copConv + ' COP</span>' +
           '</div>';
  }
  return '<div class="tx-amount-pill ' + colorClass + '"><span class="dot-sign">' + prefix + '</span> $' + formatMoney(t.amount) + '</div>';
};

const formatMoneyInput = function(value) {
  if (!value) return '';
  var num = value.toString().replace(/,/g, '');
  // Conserva los decimales tal cual los escribio el usuario (hasta 2), nunca
  // los redondea a un numero entero.
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const formatThousandInput = function(input) {
  var val = input.value.replace(/,/g, '');
  if (val) {
    input.value = Number(val).toLocaleString('en-US');
  }
};
window.formatThousandInput = formatThousandInput;

const getSaveBarColor = function(pct) {
  if (pct >= 100) return 'linear-gradient(135deg, #f9d423, #f7971e)';
  if (pct >= 95) return '#FF8F00';
  if (pct >= 90) return '#FFA000';
  if (pct >= 85) return '#FFC107';
  if (pct >= 80) return '#FFD700';
  return '#f0f2f5';
};

const darkenColor = function(hex, pct) {
  if (!hex) return '#f0f2f5';
  let r = parseInt(hex.slice(1,3), 16);
  let g = parseInt(hex.slice(3,5), 16);
  let b = parseInt(hex.slice(5,7), 16);
  const factor = 1 - (pct - 80) / 40 * 0.5;
  r = Math.round(r * factor);
  g = Math.round(g * factor);
  b = Math.round(b * factor);
  return `rgb(${r},${g},${b})`;
};

const toggleLanguage = function() {
  language = language === 'en' ? 'es' : 'en';
  document.getElementById('settingsLanguage').innerText = language === 'en' ? 'English' : 'Español';
  renderApp();
};

const togglePrimaryCurrency = function() {
  toggleCurrency();
};

const toggleDatePicker = function() {
  var container = document.getElementById('datePickerContainer');
  container.classList.toggle('visible');
  if (container.classList.contains('visible')) {
    renderDatePicker();
  }
};

const renderDatePicker = function() {
  var grid = document.getElementById('datePickerGrid');
  var monthYear = document.getElementById('datePickerMonthYear');
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  monthYear.innerText = monthNames[datePickerMonth] + ' ' + datePickerYear;
  
  var firstDay = new Date(datePickerYear, datePickerMonth, 1).getDay();
  var daysInMonth = new Date(datePickerYear, datePickerMonth + 1, 0).getDate();
  
  var html = '';
  var dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  for (var i = 0; i < 7; i++) {
    html += '<div class="day-name">' + dayNames[i] + '</div>';
  }
  
  for (var d = 0; d < firstDay; d++) {
    html += '<div class="day-cell empty"></div>';
  }
  
  var today = new Date();
  for (var day = 1; day <= daysInMonth; day++) {
    var isToday = (day === today.getDate() && datePickerMonth === today.getMonth() && datePickerYear === today.getFullYear());
    var isSelected = dateTouched && (day === selectedDay && datePickerMonth === selectedMonth && datePickerYear === selectedYear);
    var cls = 'day-cell';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';
    html += '<div class="' + cls + '" onclick="selectDate(' + day + ')">' + day + '</div>';
  }
  grid.innerHTML = html;
};

const changeDateMonth = function(delta) {
  datePickerMonth += delta;
  if (datePickerMonth < 0) { datePickerMonth = 11; datePickerYear--; }
  if (datePickerMonth > 11) { datePickerMonth = 0; datePickerYear++; }
  renderDatePicker();
};


// ===== FECHAS AMIGABLES (Hoy / Ayer / Lunes 21 sep) + HORA =====
function txFechaObj(t) {
  var ts = t.ts || (t.id > 1e12 ? t.id : null);
  var base = ts ? new Date(ts) : null;
  var year = t.y || (base ? base.getFullYear() : new Date().getFullYear());
  var raw = t.date || '';
  var mt = raw.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]{3})/);
  if (!mt) {
    if (raw && raw !== 'Today') return { raw: raw };
    return base ? { date: base, time: base } : null;
  }
  var d = +mt[1];
  var m = monthsList.findIndex(function(x) { return x.substring(0, 3).toLowerCase() === mt[2].toLowerCase(); });
  if (m === -1 && t.month) m = monthsList.indexOf(t.month);
  if (m === -1) return base ? { date: base, time: base } : null;
  return { date: new Date(year, m, d), time: base };
}
window.txFechaObj = txFechaObj;

window.etiquetaFechaAmigable = function(d) {
  var es = language === 'es';
  var h = new Date(); h.setHours(0, 0, 0, 0);
  var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var diff = Math.round((h - x) / 86400000);
  if (diff === 0) return es ? 'Hoy' : 'Today';
  if (diff === 1) return es ? 'Ayer' : 'Yesterday';
  var wd = d.toLocaleDateString(es ? 'es' : 'en', { weekday: 'long' });
  wd = wd.charAt(0).toUpperCase() + wd.slice(1);
  var mon = d.toLocaleDateString(es ? 'es' : 'en', { month: 'short' }).replace('.', '').replace(/^sept$/i, 'sep');
  return wd + ' ' + d.getDate() + ' ' + mon + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
};

function txEsc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

window.openTxDetail = function(id) {
  var t = transactions.find(function(x) { return x.id === id; });
  if (!t) return;
  var es = language === 'es';
  var cat = allCategories.find(function(c) { return c.id === t.catId; }) || { icon: '📌', name: 'Other' };
  var col = t.type === 'income' ? '#2e9e4f' : t.type === 'save' ? '#007aff' : '#e5484d';
  var bg = t.type === 'income' ? '#eaf7ee' : t.type === 'save' ? '#eaf3ff' : '#fdeeee';
  var prefix = t.type === 'income' ? '+' : t.type === 'expense' ? '−' : '';
  var kind = t.type === 'income' ? (es ? 'Ingreso' : 'Income') : t.type === 'save' ? (es ? 'Ahorro' : 'Savings') : (es ? 'Egreso' : 'Expense');
  var fromLbl = t.type === 'income' ? (es ? '¿A dónde entró la plata?' : 'Where did the money go?')
              : t.type === 'save' ? (es ? '¿De dónde se apartó?' : 'Set aside from?')
              : (es ? '¿De dónde salió la plata?' : 'Where did the money come from?');

  var f = txFechaObj(t), fechaTxt = '—';
  if (f && f.raw) fechaTxt = f.raw;
  else if (f) {
    fechaTxt = window.etiquetaFechaAmigable(f.date);
    if (f.time) fechaTxt += (es ? ' a las ' : ' at ') + f.time.toLocaleTimeString(es ? 'es-CO' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  var acc = t.accStr === 'Cash' || t.accStr === 'Efectivo' ? '💵 ' + (es ? 'Efectivo' : 'Cash')
          : t.accStr === 'Sistema' ? '⚙️ Sistema' : '💳 ' + (t.accStr || '—');
  var amtMain = prefix + '$' + formatMoney(t.amount) + ' ' + primaryCurrency;
  var amtSub = '';
  if (t.origCurrency && t.origCurrency !== primaryCurrency && t.origAmount != null) {
    amtSub = '<div class="txd-sub">$' + Number(t.origAmount).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + t.origCurrency + '</div>';
  }
  var ref = 'F' + String(t.id).slice(-8);
  var tags = (t.tags && t.tags.length) ? '<div class="txd-row"><div class="txd-label">' + (es ? 'Etiquetas' : 'Tags') + '</div><div class="txd-tags">' + t.tags.map(function(g) { return '<span>#' + txEsc(g) + '</span>'; }).join('') + '</div></div>' : '';

  document.getElementById('txDetailBody').innerHTML =
    '<div class="txd-hero" style="background:' + bg + ';">' +
      '<div class="txd-avatar">' + cat.icon + '</div>' +
      '<div class="txd-title">' + txEsc(t.title) + '</div>' +
      '<div class="txd-kind" style="color:' + col + ';">' + kind + ' · ' + txEsc(cat.name) + '</div>' +
    '</div>' +
    '<div class="txd-card">' +
      '<div class="txd-row"><div class="txd-label">' + (es ? '¿Cuánto?' : 'How much?') + '</div><div class="txd-value txd-amount" style="color:' + col + ';">' + amtMain + '</div>' + amtSub + '</div>' +
      '<div class="txd-row"><div class="txd-label">' + (es ? 'Fecha' : 'Date') + '</div><div class="txd-value">' + txEsc(fechaTxt) + '</div></div>' +
      '<div class="txd-row"><div class="txd-label">' + (es ? 'Categoría' : 'Category') + '</div><div class="txd-value">' + cat.icon + ' ' + txEsc(cat.name) + '</div></div>' +
      '<div class="txd-row"><div class="txd-label">' + fromLbl + '</div><div class="txd-value">' + txEsc(acc) + '</div></div>' +
      tags +
      '<div class="txd-row"><div class="txd-label">' + (es ? 'Referencia' : 'Reference') + '</div><div class="txd-value">' + ref + '</div></div>' +
    '</div>';
  var btn = document.getElementById('txDetailEditBtn');
  btn.innerText = es ? '✏️ Editar' : '✏️ Edit';
  btn.onclick = function() { closeTxDetail(); openEditTransaction(id); };
  document.getElementById('txDetailModal').classList.add('open');
};
window.closeTxDetail = function() { document.getElementById('txDetailModal').classList.remove('open'); };


// ===== TOMAR DE BALANCE =====
// Saldo disponible del mes (igual alcance que el Balance general). excludeId
// se usa al editar, para no restarle a la cuenta su propio monto anterior.
function saldoDisponibleDelMes(excludeId) {
  var tx = transactions.filter(function(t) { return t.month === currentMonth && t.id !== excludeId; });
  var inc = tx.filter(function(t) { return t.type === 'income'; }).reduce(function(s, t) { return s + t.amount; }, 0);
  var exp = tx.filter(function(t) { return t.type === 'expense'; }).reduce(function(s, t) { return s + t.amount; }, 0);
  var savTaken = tx.filter(function(t) { return t.type === 'save' && t.takeFromBalance; }).reduce(function(s, t) { return s + t.amount; }, 0);
  return inc - exp - savTaken;
}
window.toggleTakeFromBalance = function() {
  takeFromBalance = !takeFromBalance;
  document.getElementById('tfbSwitch').classList.toggle('on', takeFromBalance);
};
function actualizarVisibilidadTomarDeBalance() {
  var row = document.getElementById('takeFromBalanceRow');
  if (row) row.style.display = (txType === 'save') ? 'flex' : 'none';
}

window.etiquetaFechaCorta = function(d) {
  return d.getDate() + ' ' + d.toLocaleString(language === 'es' ? 'es' : 'en', { month: 'short' }).replace('.', '').replace(/^sept$/i, 'sep');
};

const selectDate = function(day) {
  selectedDay = day;
  selectedMonth = datePickerMonth;
  selectedYear = datePickerYear;
  dateTouched = true;
  dateUserPicked = true;
  var _dSel = new Date(selectedYear, selectedMonth, selectedDay);
  datePickerBtnLabel = window.etiquetaFechaAmigable(_dSel);
  document.getElementById('datePickerBtn').innerHTML = datePickerBtnLabel + ' ▾';
  document.getElementById('datePickerContainer').classList.remove('visible');
};

const showCustomAlert = function(emoji, title, text, badgeKind) {
  document.getElementById('alertEmoji').innerText = emoji || '🎉';
  document.getElementById('alertTitle').innerText = title || 'Felicidades';
  document.getElementById('alertDesc').innerText = text || 'Has alcanzado tu meta';
  var badge = document.getElementById('alertBadge');
  if (badgeKind === 'warning') {
    badge.innerText = language === 'es' ? '⚠️ Advertencia' : '⚠️ Warning';
    badge.classList.remove('hidden', 'positive');
  } else if (badgeKind === 'positive') {
    badge.innerText = language === 'es' ? '🎉 ¡Meta alcanzada!' : '🎉 Goal reached!';
    badge.classList.remove('hidden');
    badge.classList.add('positive');
  } else {
    badge.classList.add('hidden');
    badge.classList.remove('positive');
  }
  document.getElementById('customAlertModal').classList.add('open');
};

const closeCustomAlert = function() {
  document.getElementById('customAlertModal').classList.remove('open');
};

const openSettings = function() {
  document.getElementById('settingsModal').classList.add('open');
  document.getElementById('settingsPrimaryCurrency').innerText = primaryCurrency;
  updateSecondaryCurrencyLabel();
  document.getElementById('settingsLanguage').innerText = language === 'en' ? 'English' : 'Español';
  lastActiveModal = 'settings';
};

const closeSettings = function() {
  document.getElementById('settingsModal').classList.remove('open');
  lastActiveModal = null;
};

const openEditCategories = function() {
  closeSettings();
  renderEditCategories();
  document.getElementById('editCategoriesModal').classList.add('open');
  document.getElementById('categorySearchInput').value = '';
  lastActiveModal = 'editCategories';
};

const closeEditCategories = function() {
  document.getElementById('editCategoriesModal').classList.remove('open');
  openSettings();
};

const openEditCards = function() {
  closeSettings();
  renderEditCards();
  document.getElementById('editCardsModal').classList.add('open');
  lastActiveModal = 'editCards';
};

const closeEditCards = function() {
  document.getElementById('editCardsModal').classList.remove('open');
  openSettings();
};
