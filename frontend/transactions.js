const inpAmt = document.getElementById('inputAmount');
inpAmt.addEventListener('input', function(e) {
  if (modalCurrency === 'USD') {
    // En USD sí se permite el punto decimal (centavos), máx 2 decimales
    var raw = e.target.value.replace(/[^0-9.]/g, '');
    var firstDot = raw.indexOf('.');
    if (firstDot !== -1) {
      raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '');
      var parts = raw.split('.');
      raw = parts[0] + '.' + parts[1].slice(0, 2);
    }
    e.target.dataset.raw = raw;
    e.target.value = raw;
  } else {
    var val = e.target.value.replace(/[^0-9]/g, '');
    e.target.dataset.raw = val;
    if(val) e.target.value = Number(val).toLocaleString('en-US');
    else e.target.value = '';
  }
});

const renderModalCategories = function() {
  var catDiv = document.getElementById('modalCategories');
  var wrapDiv = document.getElementById('categoryContainerWrapper');
  var saveOptSec = document.getElementById('saveOptionsSection');
  catDiv.innerHTML = '';
  
  if(txType === 'save') {
    saveOptSec.style.display = 'block';
    if(saveSubType === 'booking') {
      wrapDiv.style.display = 'block';
      var bookingCats = allCategories.filter(function(c) { return c.type === 'save_booking' && !deletedCategories[c.id]; });
      
      var newBtn = document.createElement('button');
      newBtn.className = 'chip add-chip';
      newBtn.innerHTML = '＋ New';
      newBtn.setAttribute('onclick', 'openNewCategoryFromAdd()');
      catDiv.appendChild(newBtn);
      
      if(!bookingCats.find(function(c) { return c.id === selCatId; }) && bookingCats.length > 0) {
        selCatId = bookingCats[0].id;
      }
      bookingCats.forEach(function(c) {
        var isSel = selCatId === c.id ? 'selected' : '';
        catDiv.innerHTML += `
          <button class="chip ${isSel}" onclick="selCatId='${c.id}'; renderModalCategories();" style="flex-direction:column; align-items:flex-start; padding:8px 16px;">
            <div>${c.icon} ${c.name}</div>
          </button>`;
      });
      return;
    } else {
      wrapDiv.style.display = 'block';
    }
  } else {
    saveOptSec.style.display = 'none';
    wrapDiv.style.display = 'block';
  }

  var newBtn = document.createElement('button');
  newBtn.className = 'chip add-chip';
  newBtn.innerHTML = '＋ New';
  newBtn.setAttribute('onclick', 'openNewCategoryFromAdd()');
  catDiv.appendChild(newBtn);

  var checkType = txType === 'save' ? 'save_future' : txType;
  var relevantCats = allCategories.filter(function(c) { return c.type === checkType && !deletedCategories[c.id]; });
  
  if(!relevantCats.find(function(c) { return c.id === selCatId; }) && relevantCats.length > 0) {
      selCatId = relevantCats[0].id;
  }

  relevantCats.forEach(function(c) {
    var isSel = selCatId === c.id ? 'selected' : '';
    var progressStr = '';
    if (c.type === 'save_future' && c.target > 0) {
      var pct = getCategoryPct(c);
      progressStr = '<span class="goal-progress-sub">' + pct + '%</span>';
    } else if (c.target > 0) {
      progressStr = '<span class="goal-progress-sub">Target: $' + formatMoneyFromCategoryCurrency(c.target, c.id) + '</span>';
    }
    
    catDiv.innerHTML += `
      <button class="chip ${isSel}" onclick="selCatId='${c.id}'; renderModalCategories();" style="flex-direction:column; align-items:flex-start; padding:8px 16px;">
        <div>${c.icon} ${c.name}</div>
        ${progressStr}
      </button>`;
  });
};
window.renderModalCategories = renderModalCategories;

const renderSubCards = function() {
  var subAccDiv = document.getElementById('modalAccountsSub');
  subAccDiv.innerHTML = '';
  
  var newBtn = document.createElement('button');
  newBtn.className = 'chip add-chip';
  newBtn.innerHTML = '＋ New';
  newBtn.setAttribute('onclick', 'openNewCardWizard()');
  subAccDiv.appendChild(newBtn);
  
  var cardsToShow = myCards.slice();
  cardsToShow.forEach(function(card) {
    var isSel = selSubCard === card ? 'selected' : '';
    var color = cardColors[card];
    var attrs = color ? ' data-acc-color style="--acc-color:' + color + '; --acc-text-color:' + textoLegibleSobre(color) + '; border-left:4px solid ' + color + '; ' + (isSel ? '' : 'color:' + color + '; font-weight:700;') + '"' : '';
    subAccDiv.innerHTML += '<button class="chip ' + isSel + '"' + attrs + ' onclick="selSubCard=\'' + card + '\'; renderSubCards();">' + card + '</button>';
  });
};
window.renderSubCards = renderSubCards;

const updateModalColorsAndType = function() {
  document.getElementById('btnMinus').classList.remove('active');
  document.getElementById('btnPlus').classList.remove('active');
  document.getElementById('btnSaveType').classList.remove('active');
  inpAmt.classList.remove('color-red', 'color-green', 'color-blue');

  if(txType === 'expense') {
    document.getElementById('btnMinus').classList.add('active');
    inpAmt.classList.add('color-red');
  } else if(txType === 'income') {
    document.getElementById('btnPlus').classList.add('active');
    inpAmt.classList.add('color-green');
  } else if(txType === 'save') {
    document.getElementById('btnSaveType').classList.add('active');
    inpAmt.classList.add('color-blue');
  }
  renderModalCategories();
  actualizarVisibilidadTomarDeBalance();
};
window.updateModalColorsAndType = updateModalColorsAndType;


document.getElementById('btnMinus').onclick = function() { txType = 'expense'; updateModalColorsAndType(); };  //   EGRESO: el botón de GASTO
document.getElementById('btnPlus').onclick = function() { txType = 'income'; updateModalColorsAndType(); };// Botón: marca la transacción como INGRESO

document.getElementById('btnSaveType').onclick = function() { 
    txType = 'save'; 
    saveSubType = 'gastos_futuros'; 
    document.getElementById('btnSaveFuture').classList.add('active'); 
    document.getElementById('btnSaveBooking').classList.remove('active'); 
    updateModalColorsAndType(); 
};

window.setMainAcc = function(type) {
  mainAccType = type;
  document.getElementById('btnAccEfectivo').classList.toggle('selected', type === 'Efectivo');
  document.getElementById('btnAccTarjeta').classList.toggle('selected', type === 'Tarjeta');
  
  var subAccDiv = document.getElementById('modalAccountsSub');
  var cardTitle = document.getElementById('cardSectionTitle');
  if(type === 'Tarjeta') {
    subAccDiv.style.display = 'flex';
    cardTitle.style.display = 'block';
    renderSubCards();
  } else {
    subAccDiv.style.display = 'none';
    cardTitle.style.display = 'none';
  }
};

window.setSaveSubType = function(subType) {
  saveSubType = subType;
  document.getElementById('btnSaveFuture').classList.toggle('active', subType === 'gastos_futuros');
  document.getElementById('btnSaveBooking').classList.toggle('active', subType === 'booking');
  if(subType === 'booking') {
    var bookingCats = allCategories.filter(function(c) { return c.type === 'save_booking' && !deletedCategories[c.id]; });
    selCatId = bookingCats.length > 0 ? bookingCats[0].id : null;
  } else {
    var firstGoal = allCategories.find(function(c) { return c.type === 'save_future' && !deletedCategories[c.id]; });
    selCatId = firstGoal ? firstGoal.id : null;
  }
  renderModalCategories();
};

window.openEditTransaction = function(id) {
  editingTxId = id;
  var t = transactions.find(function(item) { return item.id === id; });
  if(!t) return;

  document.getElementById('inputDesc').value = t.title;
  if (t.origCurrency && t.origCurrency !== 'COP') {
    modalCurrency = t.origCurrency;
    inpAmt.value = Number(t.origAmount).toLocaleString('en-US', { maximumFractionDigits: 2 });
    inpAmt.dataset.raw = t.origAmount;
  } else {
    modalCurrency = 'COP';
    inpAmt.value = formatMoney(t.amount);
    inpAmt.dataset.raw = t.amount;
  }
  // Sincronizar el selector de moneda con las monedas reales del usuario
  var select = document.getElementById('modalCurrencySelect');
  if (select) {
    select.innerHTML = buildCurrencyOptionsHtml(modalCurrency);
    
    if (select.value !== modalCurrency) {
      var info = getCurrencyInfo(modalCurrency);
      select.innerHTML += '<option value="' + modalCurrency + '" selected>' + info.flag + ' ' + modalCurrency + '</option>';
    }
    select.value = modalCurrency;
  }

  currentTxTags = (t.tags || []).slice();
  renderTagChips();

  if(txType === 'save') {
    var cat = allCategories.find(function(c) { return c.id === t.catId; });
    saveSubType = cat && cat.type === 'save_booking' ? 'booking' : 'gastos_futuros';
    document.getElementById('btnSaveFuture').classList.toggle('active', saveSubType === 'gastos_futuros');
    document.getElementById('btnSaveBooking').classList.toggle('active', saveSubType === 'booking');
  }

  if(myCards.includes(t.accStr) && t.accStr !== 'Cash' && t.accStr !== 'Efectivo' && t.accStr !== 'Sistema') {
    setMainAcc('Tarjeta');
    selSubCard = t.accStr;
  } else {
    setMainAcc('Efectivo');
  }

  dateTouched = false; dateUserPicked = false;
  takeFromBalance = !!t.takeFromBalance;
  document.getElementById('tfbSwitch').classList.toggle('on', takeFromBalance);
  var _fe = txFechaObj(t);
  if (_fe && _fe.date) {
    selectedDay = _fe.date.getDate(); selectedMonth = _fe.date.getMonth(); selectedYear = _fe.date.getFullYear();
    datePickerMonth = selectedMonth; datePickerYear = selectedYear; dateTouched = true;
  }
  document.getElementById('datePickerBtn').innerHTML = ((_fe && _fe.date) ? window.etiquetaFechaAmigable(_fe.date) : (t.date || '')) + ' ▾';
  document.getElementById('datePickerContainer').classList.remove('visible');
  updateModalColorsAndType();
  document.getElementById('btnDeleteTx').style.display = 'flex';
  document.getElementById('addModal').classList.add('open');
};
// Borrar transacción
window.deleteCurrentEditingTx = function() {
  if(editingTxId) {
    transactions = transactions.filter(function(t) { return t.id !== editingTxId; });
    document.getElementById('addModal').classList.remove('open');
    alertedCategories = {};
    renderApp();
    scheduleGuardarEnFirebase();
  }
};

// GUARDAR TRANSACCIÓN (ingreso o egreso)
window.saveTransaction = function() {
  var desc = document.getElementById('inputDesc').value.trim();
  var rawStr = inpAmt.dataset.raw || '';
  var amount = parseFloat(rawStr);

// Mayor a cero
  if(isNaN(amount) || amount <= 0) {
    showCustomAlert('⚠️', 'Monto inválido', 'Por favor ingresa un monto válido.');
    return;
  }

  if (txType === 'save' && takeFromBalance) {
    var _montoCOP = convertToCOP(amount, modalCurrency);
    var _disponible = saldoDisponibleDelMes(editingTxId);
    if (_montoCOP > _disponible) {
      showCustomAlert('⚠️', 'No tienes esa cantidad disponible', 'Tu balance de este mes es $' + formatMoney(_disponible) + ' ' + primaryCurrency + '. No puedes apartar más que eso.');
      return;
    }
  }

  var cat = allCategories.find(function(c) { return c.id === selCatId; });
  if (!desc && cat) {
    desc = cat.name;
  } else if (!desc) {
    desc = 'Transaction';
  }

  var finalAmount = convertToCOP(amount, modalCurrency);
  var finalOrigCurrency = modalCurrency;
  var finalOrigAmount = amount;
  var finalAccStr = mainAccType === 'Tarjeta' ? selSubCard : 'Cash';
  var finalCatId = selCatId;
  
  if(txType === 'save' && saveSubType === 'booking') {
    finalCatId = selCatId || 'sav_booking';
    finalAccStr = selSubCard;
  }

  var _nuevoId = null;
  var _mesSel = monthsList[selectedMonth];
  var todayStr = selectedDay + ' ' + _mesSel.substring(0,3);

  if(editingTxId) {
    var t = transactions.find(function(item) { return item.id === editingTxId; });
    if(t) {
      t.title = desc;
      t.amount = finalAmount;
      t.type = txType;
      t.catId = finalCatId;
      t.accStr = finalAccStr;
      t.origCurrency = finalOrigCurrency;
      t.takeFromBalance = (txType === 'save') ? takeFromBalance : false;
      t.origAmount = finalOrigAmount;
      t.tags = currentTxTags.slice();
      if (dateUserPicked) { t.date = todayStr; t.month = _mesSel; t.y = selectedYear; }
    }
  } else {
    // Se arma el objeto de la transacción y se agrega a la lista
    var newTx = {
      id: Date.now(),
      month: _mesSel,
      type: txType,
      catId: finalCatId,
      title: desc,
      amount: finalAmount,
      accStr: finalAccStr,
      date: todayStr,
      ts: Date.now(),
      y: selectedYear,
      takeFromBalance: (txType === 'save') ? takeFromBalance : false,
      origCurrency: finalOrigCurrency,
      origAmount: finalOrigAmount,
      tags: currentTxTags.slice()
    };
 // Se agregar a la lista
    transactions.push(newTx);
    _nuevoId = newTx.id;
    if (_mesSel !== currentMonth) {
      currentMonth = _mesSel;
      document.querySelectorAll('.month-item').forEach(function(el) { el.classList.remove('active'); });
      var _mEl = document.getElementById('m_' + _mesSel.substring(0,3));
      if (_mEl) _mEl.classList.add('active');
    }
  }
  
  document.getElementById('addModal').classList.remove('open');
  document.getElementById('inputDesc').value = '';
  inpAmt.value = '';
  inpAmt.dataset.raw = '';
  editingTxId = null;
  currentTxTags = [];
  renderTagChips();
  document.getElementById('tagInputPanel').style.display = 'none';
  alertedCategories = {};
  renderApp();
  // Se manda a guardar en Firebase
  scheduleGuardarEnFirebase();
  if (_nuevoId) window.openTxDetail(_nuevoId);
};

document.getElementById('btnOpenAdd').onclick = function() {
  editingTxId = null;
  document.getElementById('inputDesc').value = '';
  inpAmt.value = '';
  inpAmt.dataset.raw = '';
  txType = (typeFilter === 'income' || typeFilter === 'save') ? typeFilter : 'expense';
  saveSubType = (txType === 'save' && mainSaveView === 'booking') ? 'booking' : 'gastos_futuros';
  var _hoy = new Date();
  selectedDay = _hoy.getDate(); selectedMonth = _hoy.getMonth(); selectedYear = _hoy.getFullYear();
  datePickerMonth = selectedMonth; datePickerYear = selectedYear; dateTouched = false; dateUserPicked = false;
  takeFromBalance = false;
  document.getElementById('tfbSwitch').classList.remove('on');
  document.getElementById('datePickerBtn').innerHTML = window.etiquetaFechaAmigable(_hoy) + ' ▾';
  document.getElementById('datePickerContainer').classList.remove('visible');
  modalCurrency = primaryCurrency;
  var select = document.getElementById('modalCurrencySelect');
  if (select) {
    select.innerHTML = buildCurrencyOptionsHtml(modalCurrency);
    select.value = modalCurrency;
  }
  document.getElementById('btnDeleteTx').style.display = 'none';
  currentTxTags = [];
  renderTagChips();
  document.getElementById('tagInputPanel').style.display = 'none';
  updateModalColorsAndType();
  if (txType === 'save') {
    document.getElementById('btnSaveFuture').classList.toggle('active', saveSubType === 'gastos_futuros');
    document.getElementById('btnSaveBooking').classList.toggle('active', saveSubType === 'booking');
    if (saveSubType === 'booking') setSaveSubType('booking');
  }
  document.getElementById('addModal').classList.add('open');
};

document.getElementById('btnCloseAdd').onclick = function() {
  document.getElementById('addModal').classList.remove('open');
};

const getAllUsedTags = function() {
  var set = new Set();
  transactions.forEach(function(t) {
    (t.tags || []).forEach(function(tag) { set.add(tag); });
  });
  return Array.from(set).sort();
};

window.toggleTagInput = function() {
  var panel = document.getElementById('tagInputPanel');
  var isOpen = panel.style.display === 'flex';
  if (isOpen) {
    panel.style.display = 'none';
    document.getElementById('tagSuggestions').innerHTML = '';
  } else {
    panel.style.display = 'flex';
    document.getElementById('tagInputField').value = '';
    document.getElementById('tagInputField').focus();
    handleTagInput('');
  }
};

window.renderTagChips = function() {
  var row = document.getElementById('tagsDisplayRow');
  row.innerHTML = '';
  currentTxTags.forEach(function(tag, idx) {
    row.innerHTML += '<span class="tag-chip">#' + tag + ' <span class="tag-remove" onclick="removeTag(' + idx + ')">✕</span></span>';
  });
  var btn = document.getElementById('btnOpenTags');
  if (btn) btn.classList.toggle('has-tags', currentTxTags.length > 0);
};

window.removeTag = function(idx) {
  currentTxTags.splice(idx, 1);
  renderTagChips();
};

window.addTagFromInput = function() {
  var field = document.getElementById('tagInputField');
  var val = field.value.trim().replace(/^#/, '');
  if (val && currentTxTags.indexOf(val) === -1) {
    currentTxTags.push(val);
    renderTagChips();
  }
  field.value = '';
  handleTagInput('');
};

window.handleTagKeydown = function(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTagFromInput();
  }
};

// Respaldo para teclados móviles que no siempre disparan "keydown: Enter"
// (mandan un salto de línea directo en el valor, o simplemente pierden el foco)
window.handleTagInputBlur = function() {
  var field = document.getElementById('tagInputField');
  if (field && field.value.trim()) addTagFromInput();
};

window.handleTagInput = function(val) {
  if (val.indexOf('\n') !== -1) {
    addTagFromInput();
    return;
  }
  val = (val || '').trim().replace(/^#/, '').toLowerCase();
  var suggestionsDiv = document.getElementById('tagSuggestions');
  var used = getAllUsedTags().filter(function(tag) {
    return currentTxTags.indexOf(tag) === -1 && (!val || tag.toLowerCase().includes(val));
  });
  suggestionsDiv.innerHTML = '';
  used.slice(0, 8).forEach(function(tag) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tag-suggestion-btn';
    b.innerText = '#' + tag;
    b.onclick = function() {
      currentTxTags.push(tag);
      renderTagChips();
      document.getElementById('tagInputField').value = '';
      document.getElementById('tagInputField').focus();
      handleTagInput('');
    };
    suggestionsDiv.appendChild(b);
  });
};


window.filterByMonth = function(m) {
  currentMonth = m;
  document.querySelectorAll('.month-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  renderApp();
};

window.toggleTypeFilter = function(type) {
  categoryFilter = null;
  typeFilter = type;
  renderApp();
};

window.clearCategoryFilter = function() {
  categoryFilter = null;
  renderApp();
};

window.applyCategoryFilter = function(id) {
  if (categoryFilter === id) {
    categoryFilter = null;
  } else {
    categoryFilter = id;
  }
  renderApp();
};

window.setMainSaveView = function(view) {
  mainSaveView = view;
  document.getElementById('mainBtnFuture').classList.toggle('active', view === 'future');
  document.getElementById('mainBtnBooking').classList.toggle('active', view === 'booking');
  renderApp();
};

window.toggleAccordionDetails = function() {
  accordionOpen = !accordionOpen;
  document.getElementById('accordionContent').classList.toggle('open', accordionOpen);
  document.getElementById('accordionArrow').classList.toggle('open', accordionOpen);
};

window.cycleDetailMode = function(e) {
  e.stopPropagation();
  detailMode = detailMode === 'cards' ? 'history' : 'cards';
  renderApp();
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
});

window.onload = function() {
  const currentNameMap = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const d = new Date();
  currentMonth = currentNameMap[d.getMonth()] || 'July';

  document.querySelectorAll('.month-item').forEach(el => el.classList.remove('active'));
  const targetMonthEl = document.getElementById('m_' + currentMonth.substring(0,3));
  if (targetMonthEl) {
    targetMonthEl.classList.add('active');
    targetMonthEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  updateSecondaryCurrencyLabel();

  handleMonthRollover();
  restorePendingRolloverFromStorage();
  processRecurringCharges();

  renderApp();
  applyTranslations()

  if (pendingRolloverMonth && negativeBalanceAlert && !negativeBalanceAlert.decided && negativeBalanceAlert.expiresAt > Date.now()) {
    setTimeout(function() { openMonthRolloverModal(); }, 400);
  }

  document.getElementById('btnToggleCalendar').onclick = function() {
    document.getElementById('calendarBar').classList.toggle('visible');
    if (document.getElementById('calendarBar').classList.contains('visible')) {
      const activeM = document.getElementById('m_' + currentMonth.substring(0,3));
      if (activeM) activeM.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };
};

