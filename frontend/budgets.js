// ===== FUNCIONES PARA PESTAÑAS DE PRESUPUESTOS (Fase 4) =====
function switchBudgetTab(tab) {
  currentBudgetTab = tab;
  document.querySelectorAll('.budget-tab').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-budget-type') === tab);
  });
  var subTabs = document.getElementById('budgetSubTabs');
  if (tab === 'save') {
    subTabs.style.display = 'flex';
  } else {
    subTabs.style.display = 'none';
  }
  renderBudgets();
}
window.switchBudgetTab = switchBudgetTab;

function switchBudgetSubTab(sub) {
  currentBudgetSub = sub;
  document.querySelectorAll('.budget-subtab').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-budget-sub') === sub);
  });
  renderBudgets();
}
window.switchBudgetSubTab = switchBudgetSubTab;

function updateBudgetCurrency(catId, currency) {
  categoryCurrencies[catId] = currency;
  localStorage.setItem('categoryCurrencies_v28', JSON.stringify(categoryCurrencies));
  scheduleGuardarEnFirebase();
}
window.updateBudgetCurrency = updateBudgetCurrency;

const openBudgets = function() {
  closeSettings();
  // Reset tabs
  currentBudgetTab = 'expense';
  currentBudgetSub = 'future';
  document.querySelectorAll('.budget-tab').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-budget-type') === 'expense');
  });
  document.getElementById('budgetSubTabs').style.display = 'none';
  renderBudgets();
  document.getElementById('budgetsModal').classList.add('open');
  alertedCategories = {};
  lastActiveModal = 'budgets';
};


const closeBudgets = function() {
  document.getElementById('budgetsModal').classList.remove('open');
  document.getElementById('budgetCategorySearch').style.display = 'none';
  openSettings();
};

const openFutureSavings = function() {
  closeSettings();
  renderFutureSavings();
  document.getElementById('futureSavingsModal').classList.add('open');
  lastActiveModal = 'futureSavings';
};

const closeFutureSavings = function() {
  document.getElementById('futureSavingsModal').classList.remove('open');
  openSettings();
};

const rcPad2 = function(n) { return n < 10 ? ('0' + n) : ('' + n); };
const rcToISO = function(d) { return d.getFullYear() + '-' + rcPad2(d.getMonth() + 1) + '-' + rcPad2(d.getDate()); };
const rcFromISO = function(s) { var p = s.split('-'); return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])); };
const rcAddDaysISO = function(iso, n) { var d = rcFromISO(iso); d.setDate(d.getDate() + n); return rcToISO(d); };
const rcAddMonthsClamped = function(iso, n) {
  var d = rcFromISO(iso); var day = d.getDate();
  var target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  var lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return rcToISO(target);
};
const rcAddYearsClamped = function(iso, n) {
  var d = rcFromISO(iso); var day = d.getDate();
  var target = new Date(d.getFullYear() + n, d.getMonth(), 1);
  var lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return rcToISO(target);
};
const rcMonthNamesEs = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const rcWeekdayCount = 7;

const rcGetStep = function(rc) {
  if (rc.freq === 'week') return { kind: 'days', n: 7 };
  if (rc.freq === '15days') return { kind: 'days', n: 15 };
  if (rc.freq === 'year') return { kind: 'years', n: 1 };
  if (rc.freq !== 'custom') return { kind: 'months', n: 1 };
  var n = rc.customValue > 0 ? rc.customValue : 1;
  if (rc.customUnit === 'weeks') return { kind: 'days', n: n * 7 };
  if (rc.customUnit === 'months') return { kind: 'months', n: n };
  if (rc.customUnit === 'years') return { kind: 'years', n: n };
  return { kind: 'days', n: n };
};

const rcAdvanceISO = function(iso, rc) {
  var step = rcGetStep(rc);
  if (step.kind === 'days') return rcAddDaysISO(iso, step.n);
  if (step.kind === 'months') return rcAddMonthsClamped(iso, step.n);
  return rcAddYearsClamped(iso, step.n);
};

const rcFreqLabel = function(rc) {
  if (rc.freq === 'week') return 'Cada semana';
  if (rc.freq === '15days') return 'Cada 15 días';
  if (rc.freq === 'year') return 'Cada año';
  if (rc.freq !== 'custom') return 'Cada mes';
  var unitLabels = { days: 'días', weeks: 'semanas', months: 'meses', years: 'años' };
  return 'Cada ' + (rc.customValue || 1) + ' ' + (unitLabels[rc.customUnit] || 'días');
};

const rcDisplayDate = function(iso) {
  if (!iso) return '';
  var d = rcFromISO(iso);
  return d.getDate() + ' de ' + rcMonthNamesEs[d.getMonth()];
};

const openRecurringCharges = function() {
  closeSettings();
  renderRecurringCharges();
  if (window.refrescarEstadoNotificaciones) window.refrescarEstadoNotificaciones();
  document.getElementById('recurringChargesModal').classList.add('open');
  lastActiveModal = 'recurringCharges';
};
window.openRecurringCharges = openRecurringCharges;

const closeRecurringCharges = function() {
  document.getElementById('recurringChargesModal').classList.remove('open');
  openSettings();
};
window.closeRecurringCharges = closeRecurringCharges;

const renderRecurringCharges = function() {
  var list = document.getElementById('recurringChargesList');
  list.innerHTML = '';
  if (recurringCharges.length === 0) {
    list.innerHTML = '<div style="color:#8a8a8a; text-align:center; padding:20px; font-size:14px;">Aún no tienes cobros recurrentes programados.</div>';
    return;
  }
  recurringCharges.forEach(function(rc) {
    var amountStr = rc.currency === 'USD' ? ('$' + Number(rc.amount).toLocaleString('en-US') + ' USD') : ('$' + formatMoney(rc.amount) + ' COP');
    var modeLabel = rc.mode === 'transaction' ? 'Transacción real' : 'Recordatorio';
    var modeClass = rc.mode === 'transaction' ? 'transaction' : 'reminder';
    list.innerHTML += `
      <div class="recurring-item" onclick="openEditRecurringWizard('${rc.id}')">
        <div class="rec-info">
          <span class="rec-icon">${rc.icon}</span>
          <div>
            <div class="rec-name">${rc.name}</div>
            <div class="rec-sub">${rcFreqLabel(rc)} (${rcDisplayDate(rc.anchorDate)}) • ${rc.card}</div>
          </div>
        </div>
        <div>
          <div class="rec-amount">${amountStr}</div>
          <div class="rec-mode-badge ${modeClass}">${modeLabel}</div>
        </div>
      </div>
    `;
  });
};
window.renderRecurringCharges = renderRecurringCharges;

const renderRecurringCalendar = function() {
  var grid = document.getElementById('recurringCalendarGrid');
  var label = document.getElementById('recurringCalMonthLabel');
  label.innerText = rcMonthNamesEs[recurringCalMonth] + ' ' + recurringCalYear;
  grid.innerHTML = '';

  var todayISO = rcToISO(new Date());
  var firstOfMonth = new Date(recurringCalYear, recurringCalMonth, 1);
  var startWeekday = firstOfMonth.getDay();
  var daysInMonth = new Date(recurringCalYear, recurringCalMonth + 1, 0).getDate();

  for (var i = 0; i < startWeekday; i++) {
    grid.innerHTML += '<div class="calendar-day empty"></div>';
  }
  for (var d = 1; d <= daysInMonth; d++) {
    var dISO = recurringCalYear + '-' + rcPad2(recurringCalMonth + 1) + '-' + rcPad2(d);
    var cls = 'calendar-day';
    if (dISO === todayISO) cls += ' today';
    if (dISO === recurringSelectedDateISO) cls += ' selected';
    grid.innerHTML += '<div class="' + cls + '" onclick="selectRecurringCalendarDay(\'' + dISO + '\')">' + d + '</div>';
  }
};

window.calNavMonth = function(delta) {
  recurringCalMonth += delta;
  if (recurringCalMonth < 0) { recurringCalMonth = 11; recurringCalYear--; }
  if (recurringCalMonth > 11) { recurringCalMonth = 0; recurringCalYear++; }
  renderRecurringCalendar();
};

window.selectRecurringCalendarDay = function(dISO) {
  recurringSelectedDateISO = dISO;
  renderRecurringCalendar();
  recurringNotifications = [];
  renderRecurringNotifyDetailList();
  if (recurringMode === 'reminder') {
    document.getElementById('recurringNotifySection').style.display = 'block';
  }
};

window.toggleRecurringDateSection = function() {
  recurringDateOpen = !recurringDateOpen;
  document.getElementById('recurringDateSection').style.display = recurringDateOpen ? 'block' : 'none';
  if (recurringDateOpen) renderRecurringCalendar();
};

window.setRecurringFreq = function(freq) {
  recurringFreq = freq;
  ['week', '15days', 'month', 'year'].forEach(function(f) {
    var el = document.getElementById('freq_' + f);
    if (el) el.classList.toggle('active', f === freq);
  });
  var customBtn = document.getElementById('btnCustomFreq');
  customBtn.style.borderColor = freq === 'custom' ? '#007aff' : '#b0b0b0';
  customBtn.style.color = freq === 'custom' ? '#007aff' : '#8a8a8a';
  customBtn.style.background = freq === 'custom' ? '#f0f7ff' : 'transparent';
  document.getElementById('recurringCustomFreqRow').style.display = freq === 'custom' ? 'flex' : 'none';
};

window.setRecurringCustomValue = function(v) {
  recurringCustomValue = parseInt(v) || 1;
};

window.setRecurringCustomUnit = function(u) {
  recurringCustomUnit = u;
};

window.setRecurringTxType = function(type) {
  recurringTxType = type;
  ['income', 'expense', 'save'].forEach(function(t) {
    document.getElementById('recType_' + t).classList.toggle('active', t === type);
  });
  document.getElementById('recurringSaveSubTypeRow').style.display = type === 'save' ? 'block' : 'none';
  if (type === 'save' && !recurringSaveSubType) recurringSaveSubType = 'gastos_futuros';
  if (type === 'save') setRecurringSaveSubType(recurringSaveSubType);

  var matching = allCategories.filter(function(c) {
    if (deletedCategories[c.id]) return false;
    if (type === 'save') return c.type === (recurringSaveSubType === 'booking' ? 'save_booking' : 'save_future');
    return c.type === type;
  });
  if (!matching.find(function(c) { return c.id === recurringCatId; })) {
    recurringCatId = matching.length ? matching[0].id : null;
  }
  renderRecurringCategoryRow();
};

window.setRecurringSaveSubType = function(subType) {
  recurringSaveSubType = subType;
  document.getElementById('recSub_future').classList.toggle('active', subType === 'gastos_futuros');
  document.getElementById('recSub_booking').classList.toggle('active', subType === 'booking');
  var matching = allCategories.filter(function(c) {
    return !deletedCategories[c.id] && c.type === (subType === 'booking' ? 'save_booking' : 'save_future');
  });
  if (!matching.find(function(c) { return c.id === recurringCatId; })) {
    recurringCatId = matching.length ? matching[0].id : null;
  }
  renderRecurringCategoryRow();
};

const renderRecurringCategoryRow = function() {
  var row = document.getElementById('recurringCategoryRow');
  row.innerHTML = '';
  row.innerHTML += '<button class="chip add-chip" onclick="openNewCategoryFromRecurring()">➕ Nueva categoría</button>';
  var matching = allCategories.filter(function(c) {
    if (deletedCategories[c.id]) return false;
    if (recurringTxType === 'save') return c.type === (recurringSaveSubType === 'booking' ? 'save_booking' : 'save_future');
    return c.type === recurringTxType;
  });
  matching.forEach(function(c) {
    var isSel = recurringCatId === c.id ? 'selected' : '';
    row.innerHTML += '<button class="chip ' + isSel + '" onclick="setRecurringCatId(\'' + c.id + '\')">' + c.icon + ' ' + c.name + '</button>';
  });
};

window.setRecurringCatId = function(id) {
  recurringCatId = id;
  renderRecurringCategoryRow();
};

window.setRecurringPayMethod = function(method) {
  recurringPayMethod = method;
  document.getElementById('recurringPay_cash').classList.toggle('active', method === 'cash');
  document.getElementById('recurringPay_card').classList.toggle('active', method === 'card');
  var row = document.getElementById('recurringCardsRow');
  if (method === 'cash') {
    row.style.display = 'none';
    recurringSelectedCard = 'Cash';
  } else {
    row.style.display = 'flex';
    if (recurringSelectedCard === 'Cash') recurringSelectedCard = myCards[0] || 'Nu';
    renderRecurringCardsRow();
  }
};

const renderRecurringCardsRow = function() {
  var row = document.getElementById('recurringCardsRow');
  row.innerHTML = '';
  if (recurringPayMethod !== 'card') return;
  myCards.forEach(function(c) {
    var isSel = recurringSelectedCard === c ? 'selected' : '';
    row.innerHTML += '<button class="chip ' + isSel + '" onclick="setRecurringCard(\'' + c + '\')">💳 ' + c + '</button>';
  });
};

window.setRecurringCard = function(c) {
  recurringSelectedCard = c;
  renderRecurringCardsRow();
};

window.toggleRecurringCurrency = function() {
  recurringCurrency = recurringCurrency === 'COP' ? 'USD' : 'COP';
  document.getElementById('recurringCurrDisplay').innerText = recurringCurrency + ' ▾';
};

window.setRecurringMode = function(mode) {
  recurringMode = mode;
  document.getElementById('recurringModeReminder').classList.toggle('active', mode === 'reminder');
  document.getElementById('recurringModeTransaction').classList.toggle('active', mode === 'transaction');
  document.getElementById('recurringNotifySection').style.display = (mode === 'reminder' && recurringSelectedDateISO) ? 'block' : 'none';
};

const RC_NOTIFY_EMOJIS = ['⏰', '🔔', '💋', '⏳', '💙', '😊'];
const RC_NOTIFY_COLORS = ['#ffe1ec', '#e1f0ff', '#fff6d9'];

window.toggleRecurringNotifyCalendar = function() {
  recurringNotifyCalendarOpen = !recurringNotifyCalendarOpen;
  document.getElementById('recurringNotifyCalendarSection').style.display = recurringNotifyCalendarOpen ? 'block' : 'none';
  if (recurringNotifyCalendarOpen && recurringSelectedDateISO) {
    var due = rcFromISO(recurringSelectedDateISO);
    recurringNotifyCalYear = due.getFullYear();
    recurringNotifyCalMonth = due.getMonth();
    renderRecurringNotifyCalendar();
  }
};

window.notifyCalNavMonth = function(delta) {
  recurringNotifyCalMonth += delta;
  if (recurringNotifyCalMonth < 0) { recurringNotifyCalMonth = 11; recurringNotifyCalYear--; }
  if (recurringNotifyCalMonth > 11) { recurringNotifyCalMonth = 0; recurringNotifyCalYear++; }
  renderRecurringNotifyCalendar();
};

const renderRecurringNotifyCalendar = function() {
  if (!recurringSelectedDateISO) return;
  var grid = document.getElementById('recurringNotifyCalendarGrid');
  var label = document.getElementById('recurringNotifyCalMonthLabel');
  label.innerText = rcMonthNamesEs[recurringNotifyCalMonth] + ' ' + recurringNotifyCalYear;
  grid.innerHTML = '';

  var dueISO = recurringSelectedDateISO;
  var selectedDates = recurringNotifications.map(function(n) { return rcAddDaysISO(dueISO, -n.leadDays); });

  var firstOfMonth = new Date(recurringNotifyCalYear, recurringNotifyCalMonth, 1);
  var startWeekday = firstOfMonth.getDay();
  var daysInMonth = new Date(recurringNotifyCalYear, recurringNotifyCalMonth + 1, 0).getDate();

  for (var i = 0; i < startWeekday; i++) {
    grid.innerHTML += '<div class="calendar-day empty"></div>';
  }
  for (var d = 1; d <= daysInMonth; d++) {
    var dISO = recurringNotifyCalYear + '-' + rcPad2(recurringNotifyCalMonth + 1) + '-' + rcPad2(d);
    var cls = 'calendar-day';
    var isPastDue = dISO >= dueISO;
    if (dISO === dueISO) cls += ' due-marker';
    if (selectedDates.indexOf(dISO) !== -1) cls += ' notify-selected';
    if (isPastDue) cls += ' disabled-day';
    grid.innerHTML += '<div class="' + cls + '" onclick="' + (isPastDue ? '' : ('toggleRecurringNotifySelectDay(\'' + dISO + '\')')) + '">' + d + '</div>';
  }
};

window.toggleRecurringNotifySelectDay = function(dISO) {
  if (!recurringSelectedDateISO) return;
  var existingIdx = recurringNotifications.findIndex(function(n) {
    return rcAddDaysISO(recurringSelectedDateISO, -n.leadDays) === dISO;
  });
  if (existingIdx !== -1) {
    recurringNotifications.splice(existingIdx, 1);
  } else {
    if (recurringNotifications.length >= 3) {
      showCustomAlert('⚠️', 'Máximo 3 avisos', 'Ya elegiste 3 días de aviso. Quita uno si quieres cambiarlo.');
      return;
    }
    var due = rcFromISO(recurringSelectedDateISO);
    var picked = rcFromISO(dISO);
    var leadDays = Math.round((due - picked) / (1000 * 60 * 60 * 24));
    var colorIdx = recurringNotifications.length % RC_NOTIFY_COLORS.length;
    recurringNotifications.push({ leadDays: leadDays, emoji: RC_NOTIFY_EMOJIS[0], color: RC_NOTIFY_COLORS[colorIdx], allDay: true, time: '' });
  }
  renderRecurringNotifyCalendar();
  renderRecurringNotifyDetailList();
};

const renderRecurringNotifyDetailList = function() {
  var list = document.getElementById('recurringNotifyDetailList');
  list.innerHTML = '';
  if (!recurringSelectedDateISO) return;
  recurringNotifications.forEach(function(n, idx) {
    var dateStr = rcDisplayDate(rcAddDaysISO(recurringSelectedDateISO, -n.leadDays));
    var emojiOpts = RC_NOTIFY_EMOJIS.map(function(e) {
      return '<span class="notify-emoji-opt' + (e === n.emoji ? ' selected' : '') + '" onclick="setNotifyEmoji(' + idx + ', \'' + e + '\')">' + e + '</span>';
    }).join('');
    list.innerHTML += '' +
      '<div class="notify-detail-card" style="background:' + n.color + ';">' +
        '<div class="notify-detail-header"><span>' + n.emoji + ' Aviso: ' + dateStr + '</span><button onclick="removeNotifyDetail(' + idx + ')">🗑️</button></div>' +
        '<div class="notify-emoji-row">' + emojiOpts + '</div>' +
        '<div class="notify-time-row">' +
          '<button class="notify-allday-toggle' + (n.allDay ? ' active' : '') + '" onclick="setNotifyAllDay(' + idx + ', true)">Todo el día</button>' +
          '<input type="time" value="' + (n.time || '') + '" onclick="setNotifyAllDay(' + idx + ', false)" oninput="setNotifyTime(' + idx + ', this.value)" ' + (n.allDay ? 'disabled' : '') + '>' +
        '</div>' +
      '</div>';
  });
};

window.setNotifyEmoji = function(idx, emoji) {
  recurringNotifications[idx].emoji = emoji;
  renderRecurringNotifyDetailList();
};

window.setNotifyAllDay = function(idx, allDay) {
  recurringNotifications[idx].allDay = allDay;
  if (allDay) recurringNotifications[idx].time = '';
  renderRecurringNotifyDetailList();
};

window.setNotifyTime = function(idx, val) {
  recurringNotifications[idx].time = val;
};

window.removeNotifyDetail = function(idx) {
  recurringNotifications.splice(idx, 1);
  renderRecurringNotifyCalendar();
  renderRecurringNotifyDetailList();
};

const openEmojiPickerForRecurring = function() {
  openEmojiPicker(function(emoji) {
    recurringEmoji = emoji;
    document.getElementById('recurringEmojiDisplay').innerText = emoji;
  });
};
window.openEmojiPickerForRecurring = openEmojiPickerForRecurring;

window.openNewRecurringWizard = function() {
  recurringEditId = null;
  recurringEmoji = '🔁';
  recurringCurrency = 'COP';
  recurringMode = 'reminder';
  recurringTxType = 'expense';
  recurringCatId = 'exp_sub';
  recurringSaveSubType = 'gastos_futuros';
  recurringPayMethod = 'card';
  recurringSelectedCard = myCards[0] || 'Nu';
  recurringFreq = 'month';
  recurringCustomValue = 5;
  recurringCustomUnit = 'days';
  recurringDateOpen = false;
  recurringSelectedDateISO = null;
  recurringCalYear = new Date().getFullYear();
  recurringCalMonth = new Date().getMonth();
  recurringNotifications = [];
  recurringNotifyCalendarOpen = false;

  document.getElementById('recurringWizardTitle').innerText = 'Nuevo Cobro Recurrente';
  document.getElementById('recurringName').value = '';
  document.getElementById('recurringAmount').value = '';
  document.getElementById('recurringEmojiDisplay').innerText = recurringEmoji;
  document.getElementById('recurringSuggestedEmojis').innerHTML = '';
  document.getElementById('recurringSuggestedEmojis').classList.remove('visible');
  document.getElementById('recurringCurrDisplay').innerText = recurringCurrency + ' ▾';
  document.getElementById('recurringCustomValue').value = recurringCustomValue;
  document.getElementById('recurringCustomUnit').value = recurringCustomUnit;
  document.getElementById('recurringDateSection').style.display = 'none';
  document.getElementById('recurringNotifyCalendarSection').style.display = 'none';
  document.getElementById('btnDeleteRecurring').style.display = 'none';
  setRecurringMode('reminder');
  setRecurringTxType('expense');
  setRecurringPayMethod('card');
  setRecurringFreq('month');
  renderRecurringNotifyDetailList();
  document.getElementById('recurringChargesModal').classList.remove('open');
  document.getElementById('recurringWizardModal').classList.add('open');
};

window.openEditRecurringWizard = function(id) {
  var rc = recurringCharges.find(function(r) { return r.id === id; });
  if (!rc) return;
  recurringEditId = id;
  recurringEmoji = rc.icon;
  recurringCurrency = rc.currency;
  recurringMode = rc.mode;
  recurringTxType = rc.txType || 'expense';
  recurringCatId = rc.catId || 'exp_sub';
  var editCat = allCategories.find(function(c) { return c.id === recurringCatId; });
  recurringSaveSubType = (editCat && editCat.type === 'save_booking') ? 'booking' : 'gastos_futuros';
  recurringSelectedCard = rc.card;
  recurringPayMethod = rc.card === 'Cash' ? 'cash' : 'card';
  recurringFreq = rc.freq || 'month';
  recurringCustomValue = rc.customValue || 5;
  recurringCustomUnit = rc.customUnit || 'days';
  recurringDateOpen = false;
  recurringSelectedDateISO = rc.anchorDate || null;
  var refDate = recurringSelectedDateISO ? rcFromISO(recurringSelectedDateISO) : new Date();
  recurringCalYear = refDate.getFullYear();
  recurringCalMonth = refDate.getMonth();
  recurringNotifications = (rc.notifications || []).map(function(n) { return Object.assign({}, n); });
  recurringNotifyCalendarOpen = false;

  document.getElementById('recurringWizardTitle').innerText = 'Editar Cobro Recurrente';
  document.getElementById('recurringName').value = rc.name;
  document.getElementById('recurringAmount').value = formatMoneyInput(rc.amount);
  document.getElementById('recurringEmojiDisplay').innerText = recurringEmoji;
  document.getElementById('recurringSuggestedEmojis').innerHTML = '';
  document.getElementById('recurringSuggestedEmojis').classList.remove('visible');
  document.getElementById('recurringCurrDisplay').innerText = recurringCurrency + ' ▾';
  document.getElementById('recurringCustomValue').value = recurringCustomValue;
  document.getElementById('recurringCustomUnit').value = recurringCustomUnit;
  document.getElementById('recurringDateSection').style.display = 'none';
  document.getElementById('recurringNotifyCalendarSection').style.display = 'none';
  document.getElementById('btnDeleteRecurring').style.display = 'flex';
  setRecurringMode(recurringMode);
  setRecurringTxType(recurringTxType);
  recurringCatId = rc.catId || recurringCatId;
  renderRecurringCategoryRow();
  setRecurringPayMethod(recurringPayMethod);
  recurringSelectedCard = rc.card;
  renderRecurringCardsRow();
  setRecurringFreq(recurringFreq);
  renderRecurringNotifyDetailList();
  document.getElementById('recurringChargesModal').classList.remove('open');
  document.getElementById('recurringWizardModal').classList.add('open');
};

window.closeNewRecurringWizard = function() {
  document.getElementById('recurringWizardModal').classList.remove('open');
  openRecurringCharges();
};

window.saveRecurringCharge = function() {
  var name = document.getElementById('recurringName').value.trim();
  if (!name) {
    showCustomAlert('⚠️', 'Nombre requerido', 'Por favor ingresa un nombre para el cobro recurrente.');
    return;
  }
  var amount = parseFloat(document.getElementById('recurringAmount').value.replace(/,/g, '')) || 0;
  if (!(amount > 0)) {
    showCustomAlert('⚠️', 'Falta el monto', 'Por favor ingresa el monto que se cobra.');
    return;
  }
  if (!recurringCatId) {
    showCustomAlert('⚠️', 'Falta la categoría', 'Elige una categoría para este cobro recurrente.');
    return;
  }
  if (!recurringSelectedDateISO) {
    showCustomAlert('⚠️', 'Falta la fecha', 'Toca el botón "📅 Fecha" y elige el día en el calendario.');
    return;
  }

  var notifications = recurringNotifications.slice(0, 3);

  if (recurringEditId) {
    var rc = recurringCharges.find(function(r) { return r.id === recurringEditId; });
    if (rc) {
      var dateChanged = rc.anchorDate !== recurringSelectedDateISO;
      var freqChanged = rc.freq !== recurringFreq || rc.customValue !== recurringCustomValue || rc.customUnit !== recurringCustomUnit;
      rc.name = name;
      rc.icon = recurringEmoji;
      rc.amount = amount;
      rc.currency = recurringCurrency;
      rc.mode = recurringMode;
      rc.txType = recurringTxType;
      rc.catId = recurringCatId;
      rc.card = recurringSelectedCard;
      rc.freq = recurringFreq;
      rc.customValue = recurringCustomValue;
      rc.customUnit = recurringCustomUnit;
      rc.notifications = notifications;
      if (dateChanged || freqChanged) {
        rc.anchorDate = recurringSelectedDateISO;
        rc.lastAppliedDate = null;
        rc.notifiedFor = null;
      }
    }
  } else {
    recurringCharges.push({
      id: 'rec_' + Date.now(),
      name: name,
      icon: recurringEmoji,
      amount: amount,
      currency: recurringCurrency,
      mode: recurringMode,
      txType: recurringTxType,
      catId: recurringCatId,
      card: recurringSelectedCard,
      freq: recurringFreq,
      customValue: recurringCustomValue,
      customUnit: recurringCustomUnit,
      notifications: notifications,
      anchorDate: recurringSelectedDateISO,
      lastAppliedDate: null,
      notifiedFor: null
    });
  }

  saveRecurringChargesToStorage();
  scheduleGuardarEnFirebase(); // FALTABA: crear/editar un cobro recurrente nunca disparaba el guardado en la nube.
  document.getElementById('recurringWizardModal').classList.remove('open');
  openRecurringCharges();
};

window.deleteRecurringCharge = function() {
  if (!recurringEditId) return;
  if (!confirm('¿Cancelar esta suscripción / cobro recurrente?')) return;
  recurringCharges = recurringCharges.filter(function(r) { return r.id !== recurringEditId; });
  saveRecurringChargesToStorage();
  scheduleGuardarEnFirebase(); // FALTABA: eliminar un cobro recurrente nunca disparaba el guardado en la nube.
  document.getElementById('recurringWizardModal').classList.remove('open');
  openRecurringCharges();
};

const rcApplyAsTransaction = function(rc, dateISO) {
  var d = rcFromISO(dateISO);
  var nameMap = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var monthName = nameMap[d.getMonth()];
  var finalAmount = convertToCOP(rc.amount, rc.currency);
  var txType = rc.txType || 'expense';
  transactions.push({
    id: Date.now() + Math.random(),
    month: monthName,
    type: txType,
    catId: rc.catId || 'exp_sub',
    title: rc.icon + ' ' + rc.name + ' (Cobro recurrente)',
    amount: finalAmount,
    accStr: rc.card,
    date: d.getDate() + ' ' + monthName.substring(0, 3),
    origCurrency: rc.currency,
    origAmount: rc.amount,
    tags: []
  });
};

const processRecurringCharges = function() {
  var todayISO = rcToISO(new Date());
  var changed = false;
  var remindersToShow = [];

  recurringCharges.forEach(function(rc) {
    if (!rc.anchorDate) return;

    var nextDue = rc.lastAppliedDate ? rcAdvanceISO(rc.lastAppliedDate, rc) : rc.anchorDate;
    var guard = 0;
    while (nextDue <= todayISO && guard < 60) {
      if (rc.mode === 'transaction') {
        rcApplyAsTransaction(rc, nextDue);
      } else if (nextDue === todayISO) {
        remindersToShow.push({ rc: rc, leadDays: 0 });
      }
      rc.lastAppliedDate = nextDue;
      nextDue = rcAdvanceISO(nextDue, rc);
      changed = true;
      guard++;
    }

    if (rc.mode === 'reminder' && Array.isArray(rc.notifications) && rc.notifications.length) {
      var upcoming = rc.lastAppliedDate ? rcAdvanceISO(rc.lastAppliedDate, rc) : rc.anchorDate;
      if (!rc.notifiedFor || rc.notifiedFor.date !== upcoming) {
        rc.notifiedFor = { date: upcoming, days: [] };
      }
      rc.notifications.forEach(function(notif) {
        var notifyDateISO = rcAddDaysISO(upcoming, -notif.leadDays);
        if (notifyDateISO === todayISO && rc.notifiedFor.days.indexOf(notif.leadDays) === -1) {
          rc.notifiedFor.days.push(notif.leadDays);
          changed = true;
          remindersToShow.push({ rc: rc, leadDays: notif.leadDays, notif: notif });
        }
      });
    }
  });

  if (changed) saveRecurringChargesToStorage();

  if (remindersToShow.length > 0) {
    var first = remindersToShow[0];
    var rc0 = first.rc;
    var amountStr = rc0.currency === 'USD' ? ('$' + Number(rc0.amount).toLocaleString('en-US') + ' USD') : ('$' + formatMoney(rc0.amount) + ' COP');
    var msg, icon;
    if (first.leadDays > 0) {
      var timeStr = (first.notif && !first.notif.allDay && first.notif.time) ? (' a las ' + first.notif.time) : '';
      icon = (first.notif && first.notif.emoji) ? first.notif.emoji : rc0.icon;
      msg = 'Faltan ' + first.leadDays + ' día' + (first.leadDays === 1 ? '' : 's') + ' para "' + rc0.name + '" (' + amountStr + ')' + timeStr + '. Te lo recordamos con cariño para que no te tome por sorpresa 💙';
    } else {
      icon = rc0.icon;
      msg = '¡Hoy toca "' + rc0.name + '" (' + amountStr + ')! No lo olvides agregar en ' + (rc0.txType === 'income' ? 'Ingresos' : rc0.txType === 'save' ? 'Ahorros' : 'Egresos') + '.';
    }
    showCustomAlert(icon, 'Recordatorio de cobro', msg, null);
  }
};

const handleMonthRollover = function() {
  var now = new Date();
  var realMonthIdx = now.getMonth();
  var realYear = now.getFullYear();
  var realMonthName = monthsList[realMonthIdx];

  var lastSeenMonthIdx = parseInt(localStorage.getItem('appLastSeenMonthIdx_v28'));
  var lastSeenYear = parseInt(localStorage.getItem('appLastSeenYear_v28'));

  if (!isNaN(lastSeenMonthIdx) && !isNaN(lastSeenYear) && (lastSeenMonthIdx !== realMonthIdx || lastSeenYear !== realYear)) {
    var prevMonthName = monthsList[lastSeenMonthIdx];
    var prevInc = transactions.filter(function(t) { return t.month === prevMonthName && t.type === 'income'; }).reduce(function(s,t) { return s + t.amount; }, 0);
    var prevExp = transactions.filter(function(t) { return t.month === prevMonthName && t.type === 'expense'; }).reduce(function(s,t) { return s + t.amount; }, 0);
    var prevBalance = prevInc - prevExp;

    // SIEMPRE guardar el rollover (positivo, negativo o cero)
    pendingRolloverAmount = prevBalance;
    pendingRolloverMonth = realMonthName;
    negativeBalanceAlert = { month: realMonthName, amount: prevBalance, expiresAt: Date.now() + (24 * 60 * 60 * 1000), decided: false };
    localStorage.setItem('negativeBalanceAlert_v28', JSON.stringify(negativeBalanceAlert));
  }

  localStorage.setItem('appLastSeenMonthIdx_v28', String(realMonthIdx));
  localStorage.setItem('appLastSeenYear_v28', String(realYear));
};

const restorePendingRolloverFromStorage = function() {
  if (negativeBalanceAlert && negativeBalanceAlert.expiresAt > Date.now() && !negativeBalanceAlert.decided) {
    pendingRolloverAmount = negativeBalanceAlert.amount;
    pendingRolloverMonth = negativeBalanceAlert.month;
  }
};

window.chooseRolloverOption = function(option) {
  if (option === 'current' && pendingRolloverMonth) {
    var isPositive = pendingRolloverAmount > 0;
    transactions.push({
      id: Date.now(),
      month: pendingRolloverMonth,
      type: isPositive ? 'income' : 'expense',
      catId: isPositive ? 'inc_carryover' : 'exp_carryover',
      title: (isPositive ? '💰' : '📉') + ' Saldo inicial (mes anterior)',
      amount: Math.abs(pendingRolloverAmount),
      accStr: 'Sistema',
      date: 'Inicio de mes',
      tags: []
    });
  }
  if (negativeBalanceAlert) {
    negativeBalanceAlert.decided = true;
    localStorage.setItem('negativeBalanceAlert_v28', JSON.stringify(negativeBalanceAlert));
  }
  document.getElementById('monthRolloverModal').classList.remove('open');
  renderApp();
  checkNegativeBalanceIconVisibility();
};

const checkNegativeBalanceIconVisibility = function() {
  var icon = document.getElementById('negativeBalanceIcon');
  if (!icon) return;
  var visible = !!(negativeBalanceAlert && negativeBalanceAlert.expiresAt > Date.now() && negativeBalanceAlert.month === currentMonth);
  icon.style.display = visible ? 'flex' : 'none';
};

const updateFutureGlobalSlider = function(val) {
  futureGlobalThreshold = parseInt(val);
  document.getElementById('futureGlobalSliderDisplay').innerText = val + '%';
};

const openDeletedGoalMenu = function(catId) {
  currentDeletedGoalId = catId;
  var cat = allCategories.find(function(c) { return c.id === catId; });
  if (!cat) return;
  document.getElementById('deletedGoalMenuName').innerHTML = cat.icon + ' ' + cat.name;
  document.getElementById('deletedGoalMenuModal').classList.add('open');
};
window.openDeletedGoalMenu = openDeletedGoalMenu;

const closeDeletedGoalMenu = function() {
  document.getElementById('deletedGoalMenuModal').classList.remove('open');
  currentDeletedGoalId = null;
};
window.closeDeletedGoalMenu = closeDeletedGoalMenu;

const deletePermanently = function() {
  if (!currentDeletedGoalId) return;
  var idx = allCategories.findIndex(function(c) { return c.id === currentDeletedGoalId; });
  if (idx > -1) {
    allCategories.splice(idx, 1);
  }
  delete deletedCategories[currentDeletedGoalId];
  localStorage.setItem('deletedCategories_v28', JSON.stringify(deletedCategories));
  closeDeletedGoalMenu();
  renderFutureSavings();
  renderApp();
};
window.deletePermanently = deletePermanently;

const restoreFromZero = function() {
  if (!currentDeletedGoalId) return;
  var cat = allCategories.find(function(c) { return c.id === currentDeletedGoalId; });
  if (!cat) return;
  
  delete deletedCategories[currentDeletedGoalId];
  localStorage.setItem('deletedCategories_v28', JSON.stringify(deletedCategories));
  
  var spent = getCategoryProgressTotal(cat);
  if (spent > 0) {
    transactions.push({
      id: Date.now(),
      month: currentMonth,
      type: 'save',
      catId: currentDeletedGoalId,
      title: '🔄 Rehecho desde 0%',
      amount: -spent,
      accStr: 'Sistema',
      date: 'Today'
    });
  }
  
  closeDeletedGoalMenu();
  renderFutureSavings();
  renderApp();
};
window.restoreFromZero = restoreFromZero;

const restoreToFull = function() {
  if (!currentDeletedGoalId) return;
  var cat = allCategories.find(function(c) { return c.id === currentDeletedGoalId; });
  if (!cat) return;
  
  var target = cat.target || 0;
  var spent = getCategoryProgressTotal(cat);
  
  delete deletedCategories[currentDeletedGoalId];
  localStorage.setItem('deletedCategories_v28', JSON.stringify(deletedCategories));
  
  if (target > spent) {
    transactions.push({
      id: Date.now(),
      month: currentMonth,
      type: 'save',
      catId: currentDeletedGoalId,
      title: '🔄 Rehecho desde 100%',
      amount: target - spent,
      accStr: 'Sistema',
      date: 'Today'
    });
  }
  
  closeDeletedGoalMenu();
  renderFutureSavings();
  renderApp();
};
window.restoreToFull = restoreToFull;

const renderFutureSavings = function() {
  var list = document.getElementById('futureSavingsList');
  var deletedList = document.getElementById('deletedFutureList');
  list.innerHTML = '';
  deletedList.innerHTML = '';

  // Mostrar TANTO save_future como save_booking (Fase 4)
  var futureCats = allCategories.filter(function(c) { 
    return (c.type === 'save_future' || c.type === 'save_booking') && !deletedCategories[c.id];
  });
  
  var active = [];
  var completed = [];
  
  futureCats.forEach(function(cat) {
    var spent = getCategoryProgressTotal(cat);
    var target = cat.target || 0;
    var isComplete = target > 0 && spent >= target;
    if (isComplete) {
      completed.push(cat);
    } else {
      active.push(cat);
    }
  });

  active.forEach(function(cat) {
    var currentTarget = cat.target || 0;
    var threshold = customThresholds[cat.id] || cat.alertThreshold || 80;
    var showThreshold = (threshold !== futureGlobalThreshold);
    var subTypeLabel = cat.type === 'save_future' ? t('future_savings_short') : t('booking_short');
    var currency = categoryCurrencies[cat.id] || 'COP';
    var menuId = 'savingsMenu_' + cat.id;
    
    list.innerHTML += `
      <div class="future-budget-item" data-cat-id="${cat.id}" style="position:relative;">
        <div class="future-budget-info">
          <span class="icon"${categoryIconBadgeStyle(cat.id)}>${cat.icon}</span>
          <div>
            <span class="name">${cat.name}</span>
            <span style="font-size:11px; color:#8a8a8a; display:block;">${subTypeLabel}</span>
          </div>
        </div>
<div class="future-budget-amount">
  <input type="text" id="future_${cat.id}" value="${formatMoneyInput(currentTarget)}" min="0" step="1000" onfocus="this.select()" oninput="formatThousandInput(this)">
  <select class="currency-selector" onchange="updateBudgetCurrency('${cat.id}', this.value)" style="padding:4px 8px; border-radius:8px; border:2px solid #eaeaea; font-weight:600; font-size:12px; background:#fff;">
    ${buildCurrencyOptionsHtml(currency)}
  </select>
  <span class="threshold-indicator ${showThreshold ? '' : 'hidden'}" style="font-size:11px; color:#007aff; font-weight:600; min-width:35px;">${threshold}%</span>
  <button class="savings-menu-btn" onclick="openSavingsCategoryMenu('${cat.id}', event)" style="background:none; border:none; font-size:18px; cursor:pointer; padding:0 4px;">⋮</button>
  <div class="savings-item-menu" id="${menuId}" style="display:none; position:absolute; right:0; top:100%; background:#fff; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.15); z-index:50; min-width:140px; padding:6px 0;">
    <div class="savings-menu-item" onclick="openEditSavingsCategory('${cat.id}')" style="padding:10px 16px; cursor:pointer; font-weight:600; font-size:14px; display:flex; align-items:center; gap:8px;">✏️ ${t('edit')}</div>
    <div class="savings-menu-item" onclick="deleteSavingsCategory('${cat.id}')" style="padding:10px 16px; cursor:pointer; font-weight:600; font-size:14px; color:#ff4b4b; display:flex; align-items:center; gap:8px;">🗑️ ${t('delete')}</div>
  </div>
</div>
        </div>
      </div>
    `;
  });

  var deletedCatIds = Object.keys(deletedCategories);
  var deletedItems = deletedCatIds.filter(function(id) {
    var cat = allCategories.find(function(c) { return c.id === id; });
    return cat && (cat.type === 'save_future' || cat.type === 'save_booking');
  });

  if (deletedItems.length > 0) {
    document.getElementById('deletedFutureSection').style.display = 'block';
    deletedItems.forEach(function(id) {
      var cat = allCategories.find(function(c) { return c.id === id; });
      if (!cat) return;
      deletedList.innerHTML += `
        <div class="deleted-future-item" onclick="openDeletedGoalMenu('${cat.id}')">
          <div class="info">
            <span class="icon">${cat.icon}</span>
            <span class="name">${cat.name}</span>
          </div>
          <span class="badge">✅ ${t('completed_goals')}</span>
        </div>
      `;
    });
  } else {
    document.getElementById('deletedFutureSection').style.display = 'none';
  }
};

// ===== FUNCIONES PARA MENÚ ⋮ DE AHORROS (Fase 4) =====
function openSavingsCategoryMenu(catId, event) {
  event.stopPropagation();
  document.querySelectorAll('.savings-item-menu').forEach(function(m) { m.style.display = 'none'; });
  var menu = document.getElementById('savingsMenu_' + catId);
  if (menu) {
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }
}
window.openSavingsCategoryMenu = openSavingsCategoryMenu;

function openEditSavingsCategory(catId) {
  var cat = allCategories.find(function(c) { return c.id === catId; });
  if (!cat) return;
  editingSavingsCategoryId = catId;
  editingSavingsEmoji = cat.icon;
  editingCategoryIconColor = categoryIconColors[catId] || null;
  document.getElementById('editSavingsCategoryId').value = catId;
  document.getElementById('editSavingsName').value = cat.name;
  document.getElementById('editSavingsEmojiDisplay').innerText = editingSavingsEmoji;
  renderIconColorPalette(editingCategoryIconColor);
  document.getElementById('editSavingsCategoryModal').classList.add('open');
  var menu = document.getElementById('savingsMenu_' + catId);
  if (menu) menu.style.display = 'none';
}
window.openEditSavingsCategory = openEditSavingsCategory;

function saveSavingsCategoryEdit() {
  var id = document.getElementById('editSavingsCategoryId').value;
  var cat = allCategories.find(function(c) { return c.id === id; });
  if (!cat) return;
  var newName = document.getElementById('editSavingsName').value.trim();
  if (!newName) {
    showCustomAlert('⚠️', t('alert_name_required'), '');
    return;
  }
  cat.name = newName;
  cat.icon = editingSavingsEmoji;
  if (editingCategoryIconColor) {
    categoryIconColors[id] = editingCategoryIconColor;
  } else {
    delete categoryIconColors[id];
  }
  localStorage.setItem('categoryIconColors_v1', JSON.stringify(categoryIconColors));
  document.getElementById('editSavingsCategoryModal').classList.remove('open');
  renderFutureSavings();
  renderApp();
  scheduleGuardarEnFirebase();
}
window.saveSavingsCategoryEdit = saveSavingsCategoryEdit;

function closeEditSavingsCategory() {
  document.getElementById('editSavingsCategoryModal').classList.remove('open');
}
window.closeEditSavingsCategory = closeEditSavingsCategory;

function openEmojiPickerForSavingsEdit() {
  openEmojiPicker(function(emoji) {
    editingSavingsEmoji = emoji;
    document.getElementById('editSavingsEmojiDisplay').innerText = emoji;
  });
}
window.openEmojiPickerForSavingsEdit = openEmojiPickerForSavingsEdit;

function deleteSavingsCategory(catId) {
  var cat = allCategories.find(function(c) { return c.id === catId; });
  if (!cat) return;
  if (confirm(t('delete') + ' "' + cat.name + '"?')) {
    var idx = allCategories.findIndex(function(c) { return c.id === catId; });
    if (idx > -1) {
      allCategories.splice(idx, 1);
      renderFutureSavings();
      renderApp();
      scheduleGuardarEnFirebase();
    }
  }
  var menu = document.getElementById('savingsMenu_' + catId);
  if (menu) menu.style.display = 'none';
}
window.deleteSavingsCategory = deleteSavingsCategory;

function openNewSavingsCategoryWizard() {
  document.getElementById('futureSavingsModal').classList.remove('open');
  wizardType = 'save';
  wizardSaveType = 'gastos_futuros';
  wizardEmoji = '📌';
  document.getElementById('wizardCategoryName').value = '';
  document.getElementById('wizardTargetAmount').value = '';
  document.getElementById('wizardEmojiDisplay').innerText = '📌';
  document.getElementById('wizardTargetField').classList.add('visible');
  document.getElementById('wizardSaveOptions').style.display = 'flex';
  document.getElementById('wizardSuggestedEmojis').innerHTML = '';
  document.getElementById('wizardSuggestedEmojis').classList.remove('visible');
  setWizardType('save');
  setWizardSaveType('gastos_futuros');
  document.getElementById('newCategoryWizardModal').classList.add('open');
  lastActiveModal = 'wizard';
}
window.openNewSavingsCategoryWizard = openNewSavingsCategoryWizard;

const saveAllFutureSavings = function() {
  allCategories.forEach(function(cat) {
    // ✅ Incluir tanto save_future como save_booking
    if ((cat.type === 'save_future' || cat.type === 'save_booking') && !deletedCategories[cat.id]) {
      var input = document.getElementById('future_' + cat.id);
      if(input) {
        var val = parseFloat(input.value.replace(/,/g, '')) || 0;
        cat.target = val;
      }
    }
  });
  // ✅ Guardar en Firebase
  scheduleGuardarEnFirebase();
  renderFutureSavings();
  closeFutureSavings();
  renderApp();
};


