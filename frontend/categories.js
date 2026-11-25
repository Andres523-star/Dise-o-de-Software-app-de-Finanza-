// ===== PALETA DE COLOR DEL ÍCONO DE CATEGORÍA (al editar, desde el lápiz) =====
const iconColorOptions = [
  '#8E44AD', // morado
  '#6C3483', // morado oscuro
  '#D2B4DE', // morado claro
  '#27AE60', // verde
  '#48C9F5', // azul cielo
  '#1B9C85', // verde azulado
  '#3498DB', // azul
  '#F39C12', // naranja
  '#E74C3C', // rojo
  '#EBDCCF'  // el tono actual por defecto (para poder "quitar" el color)
];

let editingCategoryIconColor = null;

const renderIconColorPalette = function(selectedColor) {
  var palette = document.getElementById('editIconColorPalette');
  if (!palette) return;
  palette.innerHTML = '';
  iconColorOptions.forEach(function(color) {
    var swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    if (color === selectedColor) swatch.classList.add('selected');
    swatch.style.background = color;
    swatch.onclick = function() {
      editingCategoryIconColor = color;
      renderIconColorPalette(color);
    };
    palette.appendChild(swatch);
  });
};
window.renderIconColorPalette = renderIconColorPalette;

const openCustomSlider = function(catId) {
  var cat = allCategories.find(function(c) { return c.id === catId; });
  if (!cat) return;

  var amountInput = document.getElementById('budget_' + catId) || document.getElementById('future_' + catId) || document.getElementById('income_' + catId);
  var currentAmountVal = amountInput ? (parseFloat(amountInput.value.replace(/,/g, '')) || 0) : (cat.budget || cat.target || 0);
  if (!(currentAmountVal > 0)) {
    showCustomAlert('⚠️', language === 'es' ? 'Falta el monto' : 'Amount needed',
      language === 'es' ? 'Primero necesitas agregar un monto/límite antes de configurar la alerta.' : 'You need to enter an amount/limit first before setting the alert.');
    return;
  }

  customSliderTargetId = catId;
  document.getElementById('customSliderTitle').innerText = '✏️ Custom Alert - ' + cat.name;
  document.getElementById('customSliderCategoryName').innerHTML = cat.icon + ' ' + cat.name;
  var currentVal = customThresholds[catId] || cat.alertThreshold || 80;
  document.getElementById('customNotificationSlider').value = currentVal;
  document.getElementById('customSliderDisplay').innerText = currentVal + '%';
  
  var currentColor = categoryColors[catId] || null;
  renderColorPalette(currentColor);
  
  document.getElementById('customSliderModal').classList.add('open');
};

const saveCustomSlider = function() {
  if (customSliderTargetId) {
    var val = parseInt(document.getElementById('customNotificationSlider').value);
    var cat = allCategories.find(function(c) { return c.id === customSliderTargetId; });
    if (cat) {
      customThresholds[customSliderTargetId] = val;
      cat.alertThreshold = val;
      closeCustomSlider();
      renderBudgets();
      renderApp();
    }
  }
};

const closeCustomSlider = function() {
  document.getElementById('customSliderModal').classList.remove('open');
  customSliderTargetId = null;
};

const openSearch = function() {
  document.getElementById('searchModal').classList.add('open');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('searchInput').focus();
};

const closeSearch = function() {
  document.getElementById('searchModal').classList.remove('open');
};


function normalizeSearchText(str) {
  return (str || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const monthKeyMap = {
  January: 'month_full_jan', February: 'month_full_feb', March: 'month_full_mar',
  April: 'month_full_apr', May: 'month_full_may', June: 'month_full_jun',
  July: 'month_full_jul', August: 'month_full_aug', September: 'month_full_sep',
  October: 'month_full_oct', November: 'month_full_nov', December: 'month_full_dec'
};
function translateMonthName(monthEng) {
  var key = monthKeyMap[monthEng];
  return key ? t(key) : monthEng;
}

const performSearch = function() {
  var query = normalizeSearchText(document.getElementById('searchInput').value.trim());
  var resultsDiv = document.getElementById('searchResults');
  
  if (!query) {
    resultsDiv.innerHTML = '<div style="color:#8a8a8a; text-align:center; padding:20px;">Type something to search...</div>';
    return;
  }

  var isTagSearch = query.startsWith('#');
  var tagQuery = isTagSearch ? query.substring(1).trim() : query;

  var results = transactions.filter(function(t) {
    var tags = t.tags || [];
    var tagMatch = tags.some(function(tag) { return normalizeSearchText(tag).includes(tagQuery); });

    if (isTagSearch) return tagMatch;

    var cat = allCategories.find(function(c) { return c.id === t.catId; });
    var catName = cat ? normalizeSearchText(cat.name) : '';
    var titleMatch = normalizeSearchText(t.title).includes(query);
    var catMatch = catName.includes(query);
    var accMatch = normalizeSearchText(t.accStr).includes(query);
    var typeMatch = normalizeSearchText(t.type).includes(query);
    var monthMatch = normalizeSearchText(t.month).includes(query) || normalizeSearchText(translateMonthName(t.month)).includes(query);
    var amountMatch = t.amount.toString().includes(query);
    var amountMatchFormatted = formatMoney(t.amount).includes(query);
    
    return titleMatch || catMatch || accMatch || typeMatch || monthMatch || amountMatch || amountMatchFormatted || tagMatch;
  });

  results.sort(function(a, b) { return b.id - a.id; });

  if (results.length === 0) {
    resultsDiv.innerHTML = '<div class="no-results">No results found for "<strong>' + query + '</strong>"</div>';
    return;
  }

  resultsDiv.innerHTML = '<div style="font-weight:600; margin-bottom:10px;">' + results.length + ' result' + (results.length > 1 ? 's' : '') + ' found</div>';
  results.forEach(function(t) {
    var cat = allCategories.find(function(c) { return c.id === t.catId; }) || {icon:'📌', name: 'Other'};
    var prefix = ''; var colorClass = 'expense';
    if(t.type === 'income') { prefix = '+'; colorClass = 'income'; }
    if(t.type === 'save') { prefix = ''; colorClass = 'save'; }

    // Si el resultado es de un mes distinto al que estás viendo, se avisa
    // con un texto chiquito gris — si es del mismo mes, no hace falta.
    var monthTag = (t.month !== currentMonth) ? ' <span style="color:#c2c2c2; font-weight:600;">• ' + translateMonthName(t.month) + '</span>' : '';

    resultsDiv.innerHTML += `
      <div class="search-result-item" onclick="closeSearch(); openEditTransaction(${t.id})">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">${cat.icon}</span>
          <div>
            <div style="font-weight:600; font-size:15px;">${t.title}${monthTag}</div>
            <div style="font-size:12px; color:#8a8a8a;">${cat.name} • ${t.accStr}</div>
            ${(t.tags && t.tags.length) ? '<div style="margin-top:4px; display:flex; gap:4px; flex-wrap:wrap;">' + t.tags.map(function(tg){ return '<span style="font-size:10px; font-weight:700; color:#007aff; background:rgba(0,122,255,0.1); padding:2px 8px; border-radius:10px;">#' + tg + '</span>'; }).join('') + '</div>' : ''}
          </div>
        </div>
        <div style="font-weight:700; color:${t.type === 'expense' ? '#ff4b4b' : t.type === 'income' ? '#55874c' : '#007aff'};">${prefix} $${formatMoney(t.amount)}</div>
      </div>
    `;
  });
};

const openEmojiPicker = function(callback) {
  pendingEmojiCallback = callback;
  var grid = document.getElementById('emojiPickerGrid');
  grid.innerHTML = '';
  emojis.forEach(function(emoji) {
    grid.innerHTML += '<span class="emoji-option" onclick="selectEmoji(\'' + emoji + '\')">' + emoji + '</span>';
  });
  document.getElementById('emojiPickerModal').classList.add('open');
};

const selectEmoji = function(emoji) {
  if (pendingEmojiCallback) {
    pendingEmojiCallback(emoji);
    pendingEmojiCallback = null;
  }
  closeEmojiPicker();
};

const closeEmojiPicker = function() {
  document.getElementById('emojiPickerModal').classList.remove('open');
  pendingEmojiCallback = null;
};

const openNewCategoryWizardFromSettings = function() {
  document.getElementById('editCategoriesModal').classList.remove('open');
  wizardType = 'expense';
  wizardSaveType = 'gastos_futuros';
  wizardEmoji = '📌';
  document.getElementById('wizardCategoryName').value = '';
  document.getElementById('wizardTargetAmount').value = '';
  document.getElementById('wizardEmojiDisplay').innerText = '📌';
  document.getElementById('wizardTargetField').classList.remove('visible');
  document.getElementById('wizardSaveOptions').style.display = 'none';
  document.getElementById('wizardSuggestedEmojis').innerHTML = '';
  document.getElementById('wizardSuggestedEmojis').classList.remove('visible');
  setWizardType('expense');
  document.getElementById('newCategoryWizardModal').classList.add('open');
  lastActiveModal = 'wizard';
};

const closeNewCategoryWizard = function() {
  document.getElementById('newCategoryWizardModal').classList.remove('open');
  openEditCategories();
};

const setWizardType = function(type) {
  wizardType = type;
  document.getElementById('wizardBtnExpense').className = 'wizard-type-btn' + (type === 'expense' ? ' active-red' : '');
  document.getElementById('wizardBtnIncome').className = 'wizard-type-btn' + (type === 'income' ? ' active-green' : '');
  document.getElementById('wizardBtnSave').className = 'wizard-type-btn-save' + (type === 'save' ? ' active-blue' : '');
  
  document.getElementById('wizardSaveOptions').style.display = type === 'save' ? 'flex' : 'none';
  document.getElementById('wizardTargetField').classList.toggle('visible', type === 'save');
  
  if (type === 'save') {
    setWizardSaveType('gastos_futuros');
  }
};

const setWizardSaveType = function(subType) {
  wizardSaveType = subType;
  document.getElementById('wizardBtnFuture').className = 'wizard-save-btn' + (subType === 'gastos_futuros' ? ' active' : '');
  document.getElementById('wizardBtnBooking').className = 'wizard-save-btn' + (subType === 'booking' ? ' active' : '');
};

const openEmojiPickerForWizard = function() {
  openEmojiPicker(function(emoji) {
    wizardEmoji = emoji;
    document.getElementById('wizardEmojiDisplay').innerText = emoji;
  });
};

//  CREAR CATEGORÍA /...
const saveWizardCategory = function() {
  var name = document.getElementById('wizardCategoryName').value.trim();
  if (!name) {
    showCustomAlert('⚠️', 'Nombre requerido', 'Por favor ingresa un nombre para la categoría.');
    return;
  }
  
  var newId = (wizardType === 'save' ? 'goal_' : 'cat_') + Date.now();
  var newCat = { id: newId, name: name, icon: wizardEmoji, type: wizardType, budget: 0, alertThreshold: 80 };
  
  if (wizardType === 'save') {
    if (wizardSaveType === 'booking') {
      newCat.type = 'save_booking';
    } else {
      newCat.type = 'save_future';
      var targetVal = document.getElementById('wizardTargetAmount').value.replace(/,/g, '');
      var target = parseFloat(targetVal) || 0;
      newCat.target = target;
    }
  }
  
  //  Se agrega la categoría a la lista y se guarda en Firebase
  allCategories.push(newCat);
  scheduleGuardarEnFirebase();
  closeNewCategoryWizard();
  renderEditCategories();
  renderModalCategories();
  renderApp();
};

const openNewCategoryFromAdd = function() {
  document.getElementById('addModal').classList.remove('open');
  addWizardReturnContext = 'add';
  
  addWizardType = txType;
  addWizardSaveType = saveSubType;
  addWizardEmoji = '📌';
  document.getElementById('addWizardCategoryName').value = '';
  document.getElementById('addWizardTargetAmount').value = '';
  document.getElementById('addWizardEmojiDisplay').innerText = '📌';
  document.getElementById('addWizardTargetField').classList.remove('visible');
  document.getElementById('addWizardSaveOptions').style.display = 'none';
  document.getElementById('addWizardSuggestedEmojis').innerHTML = '';
  document.getElementById('addWizardSuggestedEmojis').classList.remove('visible');
  setAddWizardType(addWizardType);
  
  document.getElementById('newCategoryFromAddModal').classList.add('open');
  
  setTimeout(function() {
    document.getElementById('addWizardCategoryName').focus();
  }, 300);
};
window.openNewCategoryFromAdd = openNewCategoryFromAdd;

window.openNewCategoryFromRecurring = function() {
  document.getElementById('recurringWizardModal').classList.remove('open');
  addWizardReturnContext = 'recurring';

  addWizardType = recurringTxType;
  addWizardSaveType = recurringSaveSubType;
  addWizardEmoji = '📌';
  document.getElementById('addWizardCategoryName').value = '';
  document.getElementById('addWizardTargetAmount').value = '';
  document.getElementById('addWizardEmojiDisplay').innerText = '📌';
  document.getElementById('addWizardTargetField').classList.remove('visible');
  document.getElementById('addWizardSaveOptions').style.display = 'none';
  document.getElementById('addWizardSuggestedEmojis').innerHTML = '';
  document.getElementById('addWizardSuggestedEmojis').classList.remove('visible');
  setAddWizardType(addWizardType);

  document.getElementById('newCategoryFromAddModal').classList.add('open');
  setTimeout(function() {
    document.getElementById('addWizardCategoryName').focus();
  }, 300);
};

const closeNewCategoryFromAdd = function() {
  document.getElementById('newCategoryFromAddModal').classList.remove('open');
  if (addWizardReturnContext === 'recurring') {
    document.getElementById('recurringWizardModal').classList.add('open');
  } else {
    document.getElementById('addModal').classList.add('open');
  }
};
window.closeNewCategoryFromAdd = closeNewCategoryFromAdd;

const setAddWizardType = function(type) {
  addWizardType = type;
  document.getElementById('addWizardBtnExpense').className = 'wizard-type-btn' + (type === 'expense' ? ' active-red' : '');
  document.getElementById('addWizardBtnIncome').className = 'wizard-type-btn' + (type === 'income' ? ' active-green' : '');
  document.getElementById('addWizardBtnSave').className = 'wizard-type-btn-save' + (type === 'save' ? ' active-blue' : '');
  
  document.getElementById('addWizardSaveOptions').style.display = type === 'save' ? 'flex' : 'none';
  document.getElementById('addWizardTargetField').classList.toggle('visible', type === 'save');
  
  if (type === 'save') {
    setAddWizardSaveType('gastos_futuros');
  }
};
window.setAddWizardType = setAddWizardType;

const setAddWizardSaveType = function(subType) {
  addWizardSaveType = subType;
  document.getElementById('addWizardBtnFuture').className = 'wizard-save-btn' + (subType === 'gastos_futuros' ? ' active' : '');
  document.getElementById('addWizardBtnBooking').className = 'wizard-save-btn' + (subType === 'booking' ? ' active' : '');
};
window.setAddWizardSaveType = setAddWizardSaveType;

const openEmojiPickerForAddWizard = function() {
  openEmojiPicker(function(emoji) {
    addWizardEmoji = emoji;
    document.getElementById('addWizardEmojiDisplay').innerText = emoji;
  });
};
window.openEmojiPickerForAddWizard = openEmojiPickerForAddWizard;

const saveAddWizardCategory = function() {
  var name = document.getElementById('addWizardCategoryName').value.trim();
  if (!name) {
    showCustomAlert('⚠️', 'Nombre requerido', 'Por favor ingresa un nombre para la categoría.');
    return;
  }
  
  var newId = (addWizardType === 'save' ? 'goal_' : 'cat_') + Date.now();
  var newCat = { id: newId, name: name, icon: addWizardEmoji, type: addWizardType, budget: 0, alertThreshold: 80 };
  
  if (addWizardType === 'save') {
    if (addWizardSaveType === 'booking') {
      newCat.type = 'save_booking';
    } else {
      newCat.type = 'save_future';
      var targetVal = document.getElementById('addWizardTargetAmount').value.replace(/,/g, '');
      var target = parseFloat(targetVal) || 0;
      newCat.target = target;
    }
  }
  
  allCategories.push(newCat);
  scheduleGuardarEnFirebase(); // crear categoría y mandar a firebase  

  if (addWizardReturnContext === 'recurring') {
    closeNewCategoryFromAdd();
    recurringTxType = newCat.type === 'income' ? 'income' : (newCat.type === 'save_future' || newCat.type === 'save_booking') ? 'save' : 'expense';
    if (newCat.type === 'save_booking') recurringSaveSubType = 'booking';
    if (newCat.type === 'save_future') recurringSaveSubType = 'gastos_futuros';
    setRecurringTxType(recurringTxType);
    recurringCatId = newId;
    renderRecurringCategoryRow();
    return;
  }

  closeNewCategoryFromAdd();
  renderModalCategories();
  renderEditCategories();
  renderApp();
  document.getElementById('addModal').classList.add('open');
  selCatId = newId;
  renderModalCategories();
};
window.saveAddWizardCategory = saveAddWizardCategory;

const openNewCardWizard = function() {
  previousModalIdBeforeCardWizard = null;
  document.querySelectorAll('.modal-overlay.open').forEach(function(m) {
    if (m.id !== 'newCardWizardModal' && m.id !== 'emojiPickerModal') {
      previousModalIdBeforeCardWizard = m.id;
    }
    m.classList.remove('open');
  });
  
  document.getElementById('wizardCardName').value = '';
  document.getElementById('newCardWizardModal').classList.add('open');
  lastActiveModal = 'newCard';
};
window.openNewCardWizard = openNewCardWizard;

const closeNewCardWizard = function() {
  document.getElementById('newCardWizardModal').classList.remove('open');
  if (previousModalIdBeforeCardWizard) {
    document.getElementById(previousModalIdBeforeCardWizard).classList.add('open');
    previousModalIdBeforeCardWizard = null;
  } else {
    openEditCards();
  }
};
window.closeNewCardWizard = closeNewCardWizard;

const saveWizardCard = function() {
  var name = document.getElementById('wizardCardName').value.trim();
  if (!name) {
    showCustomAlert('⚠️', 'Nombre requerido', 'Por favor ingresa un nombre para la tarjeta.');
    return;
  }
  myCards.push(name);
  // Asignar color por defecto si no tiene
  if (!cardColors[name]) {
    const defaultColors = ['#1a73e8', '#7c3aed', '#059669', '#dc2626', '#ea580c', '#0891b2', '#65a30d', '#9333ea', '#db2777', '#0d9488'];
    const usedColors = new Set(Object.values(cardColors));
    const availableColor = defaultColors.find(c => !usedColors.has(c)) || defaultColors[0];
    cardColors[name] = availableColor;
    localStorage.setItem('cardColors_v1', JSON.stringify(cardColors));
  }
  saveAppStateToStorage();
  scheduleGuardarEnFirebase();
  renderEditCards();
  renderSubCards();
  scheduleGuardarEnFirebase();
  closeNewCardWizard();
};
window.saveWizardCard = saveWizardCard;
const renderEditCategories = function() {
  var list = document.getElementById('editCategoriesList');
  list.innerHTML = '';
  
  // Obtener el tipo de categoría seleccionado en las pestañas
  var activeTab = document.querySelector('.edit-category-tab.active');
  var filterType = activeTab ? activeTab.getAttribute('data-type') : 'expense';
  
  var filtered = allCategories.filter(function(cat) {
    if (deletedCategories[cat.id]) return false;
    if (filterType === 'expense') return cat.type === 'expense';
    if (filterType === 'income') return cat.type === 'income';
    if (filterType === 'save') return (cat.type === 'save_future' || cat.type === 'save_booking');
    return true;
  });
  
  // Si es 'save', aplicar subtab
  if (filterType === 'save') {
    var activeSub = document.querySelector('.edit-category-subtab.active');
    var subType = activeSub ? activeSub.getAttribute('data-sub') : 'future';
    filtered = filtered.filter(function(cat) {
      if (subType === 'future') return cat.type === 'save_future';
      if (subType === 'booking') return cat.type === 'save_booking';
      return true;
    });
  }
  
  filtered.forEach(function(cat) {
    var typeLabel = cat.type === 'income' ? t('income') : (cat.type === 'expense' ? t('expense') : (cat.type === 'save_future' ? t('future_savings_short') : t('booking_short')));
    var itemStyle = (filterType === 'save') ? 'position:relative; margin-left:18px; background:#eaf4ff;' : 'position:relative;';
    list.innerHTML += `
      <div class="category-edit-item" data-cat-id="${cat.id}" style="${itemStyle}">
        <div class="cat-info">
          <span class="icon"${categoryIconBadgeStyle(cat.id)}>${cat.icon}</span>
          <div>
            <div class="name">${cat.name}</div>
            <div class="type" style="font-size:11px; color:#8a8a8a;">${typeLabel}</div>
          </div>
        </div>
        <button class="edit-category-menu-btn" onclick="openEditCategoryMenu('${cat.id}', event)" style="background:none; border:none; font-size:18px; cursor:pointer; padding:0 4px;">⋮</button>
        <div class="edit-category-item-menu" id="editCatMenu_${cat.id}" style="display:none; position:absolute; right:0; top:100%; background:#fff; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.15); z-index:50; min-width:140px; padding:6px 0;">
          <div class="edit-category-menu-item" onclick="openEditCategoryNameEmoji('${cat.id}')" style="padding:10px 16px; cursor:pointer; font-weight:600; font-size:14px; display:flex; align-items:center; gap:8px;">✏️ ${t('edit')}</div>
          <div class="edit-category-menu-item" onclick="deleteCategory('${cat.id}')" style="padding:10px 16px; cursor:pointer; font-weight:600; font-size:14px; color:#ff4b4b; display:flex; align-items:center; gap:8px;">🗑️ ${t('delete')}</div>
        </div>
      </div>
    `;
  });
};
window.renderEditCategories = renderEditCategories;

// ===== Funciones para pestañas de Editar Categorías =====
function switchEditCategoryTab(tab) {
  var tabColors = { expense: '#ff4b4b', income: '#55874c', save: '#007aff' };
  document.querySelectorAll('.edit-category-tab').forEach(function(el) {
    var elType = el.getAttribute('data-type');
    var isActive = elType === tab;
    el.classList.toggle('active', isActive);
    // Cada botón conserva SU PROPIO color (según su propio data-type), no el del tab clickeado
    var ownColor = tabColors[elType];
    el.style.borderColor = ownColor;
    el.style.color = isActive ? '#fff' : ownColor;
    el.style.background = isActive ? ownColor : '#fff';
  });
  var subTabs = document.getElementById('editCategorySubTabs');
  if (tab === 'save') {
    subTabs.style.display = 'flex';
  } else {
    subTabs.style.display = 'none';
  }
  renderEditCategories();
}
window.switchEditCategoryTab = switchEditCategoryTab;

function switchEditCategorySub(sub) {
  document.querySelectorAll('.edit-category-subtab').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-sub') === sub);
    if (el.classList.contains('active')) {
      el.style.background = '#007aff';
      el.style.color = '#fff';
    } else {
      el.style.background = '#fff';
      el.style.color = '#007aff';
    }
  });
  renderEditCategories();
}
window.switchEditCategorySub = switchEditCategorySub;

// ===== Menú ⋮ para Editar Categorías =====
function openEditCategoryMenu(catId, event) {
  event.stopPropagation();
  document.querySelectorAll('.edit-category-item-menu').forEach(function(m) { m.style.display = 'none'; });
  var menu = document.getElementById('editCatMenu_' + catId);
  if (menu) {
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }
}
window.openEditCategoryMenu = openEditCategoryMenu;

// Modal para editar nombre, emoji y color de categoría (ingresos/egresos/ahorros)
// — reutiliza el mismo modal de edición de ahorros.
function openEditCategoryNameEmoji(catId) {
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
  var menu = document.getElementById('editCatMenu_' + catId);
  if (menu) menu.style.display = 'none';
}
window.openEditCategoryNameEmoji = openEditCategoryNameEmoji;

const filterEditCategories = function() {
  var query = normalizeSearchText(document.getElementById('categorySearchInput').value);
  var items = document.querySelectorAll('#editCategoriesList .category-edit-item');
  items.forEach(function(item) {
    var name = normalizeSearchText(item.querySelector('.name').textContent);
    item.style.display = name.includes(query) ? 'flex' : 'none';
  });
};
window.filterEditCategories = filterEditCategories;

const editCategory = function(id) {
  var cat = allCategories.find(function(c) { return c.id === id; });
  if(!cat) return;
  var newName = prompt(t('edit_category_name'), cat.name);
  if(newName && newName.trim()) {
    cat.name = newName.trim();
    renderEditCategories();
    renderApp();
    scheduleGuardarEnFirebase();
  }
};
window.editCategory = editCategory;


// Cerrar cualquier menú abierto
document.querySelectorAll('.edit-category-item-menu').forEach(function(m) { m.style.display = 'none'; });

const deleteCategory = function(id) {
  if(confirm('Delete category "' + allCategories.find(function(c) { return c.id === id; }).name + '"?')) {
    var idx = allCategories.findIndex(function(c) { return c.id === id; });
    if(idx > -1) {
      allCategories.splice(idx, 1);
      renderEditCategories();
      renderApp();
      scheduleGuardarEnFirebase();
    }
  }
};
window.deleteCategory = deleteCategory;

const renderEditCards = function() {
  var list = document.getElementById('editCardsList');
  list.innerHTML = '';
  myCards.forEach(function(card) {
    var color = cardColors[card];
    var badgeStyle = color ? ' style="background:' + color + ';"' : '';
    var nameStyle = color ? ' style="color:' + color + ';"' : '';
    var dotHtml = color ? '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:' + color + '; margin-left:6px; vertical-align:middle;"></span>' : '';
    list.innerHTML += `
      <div class="card-edit-item">
        <div class="card-info">
          <span style="font-size:22px; width:40px; height:40px; border-radius:50%; background:#f0f2f5; display:flex; align-items:center; justify-content:center; flex-shrink:0;"${badgeStyle}>💳</span>
          <div>
            <div class="name"${nameStyle}>${card}${dotHtml}</div>
          </div>
        </div>
        <div class="card-actions">
          <button class="edit-btn" onclick="openEditCardModal('${card}')">✏️</button>
          <button class="delete-btn" onclick="deleteCard('${card}')">🗑️</button>
        </div>
      </div>
    `;
  });
};
window.renderEditCards = renderEditCards;

let editingCardOldName = null;
let editingCardColor = null;

function openEditCardModal(cardName) {
  editingCardOldName = cardName;
  editingCardColor = cardColors[cardName] || null;
  document.getElementById('editCardNameInput').value = cardName;
  renderCardColorPalette(editingCardColor);
  document.getElementById('editCardModal').classList.add('open');
}
window.openEditCardModal = openEditCardModal;

function closeEditCardModal() {
  document.getElementById('editCardModal').classList.remove('open');
}
window.closeEditCardModal = closeEditCardModal;

function renderCardColorPalette(selectedColor) {
  var palette = document.getElementById('editCardColorPalette');
  if (!palette) return;
  palette.innerHTML = '';
  iconColorOptions.forEach(function(color) {
    var swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    if (color === selectedColor) swatch.classList.add('selected');
    swatch.style.background = color;
    swatch.onclick = function() {
      editingCardColor = color;
      renderCardColorPalette(color);
    };
    palette.appendChild(swatch);
  });
}
window.renderCardColorPalette = renderCardColorPalette;

function saveCardEdit() {
  var newName = document.getElementById('editCardNameInput').value.trim();
  if (!newName) {
    showCustomAlert('⚠️', t('alert_name_required'), '');
    return;
  }
  var idx = myCards.indexOf(editingCardOldName);
  if (idx === -1) return;
  myCards[idx] = newName;
  if (selSubCard === editingCardOldName) selSubCard = newName;
  // Mover el color al nuevo nombre (o quitarlo si no se eligió ninguno)
  delete cardColors[editingCardOldName];
  if (editingCardColor) {
    cardColors[newName] = editingCardColor;
  } else {
    delete cardColors[newName];
  }
  localStorage.setItem('cardColors_v1', JSON.stringify(cardColors));
  closeEditCardModal();
  renderEditCards();
  renderSubCards();
  renderApp();
  scheduleGuardarEnFirebase();
}
window.saveCardEdit = saveCardEdit;

const deleteCard = function(cardName) {
  if(confirm('Delete card "' + cardName + '"?')) {
    var idx = myCards.indexOf(cardName);
    if(idx > -1) {
      myCards.splice(idx, 1);
      if (selSubCard === cardName) selSubCard = myCards[0] || 'Nu';
      renderEditCards();
      renderApp();
      scheduleGuardarEnFirebase();
    }
  }
};
window.deleteCard = deleteCard;

const renderBudgets = function() {
  var list = document.getElementById('budgetsList');
  list.innerHTML = '';
  var filtered = [];
  var catType = currentBudgetTab;
  if (catType === 'expense') {
    filtered = allCategories.filter(function(c) { return !deletedCategories[c.id] && c.type === 'expense'; });
  } else if (catType === 'income') {
    filtered = allCategories.filter(function(c) { return !deletedCategories[c.id] && c.type === 'income'; });
  } else if (catType === 'save') {
    if (currentBudgetSub === 'future') {
      filtered = allCategories.filter(function(c) { return !deletedCategories[c.id] && c.type === 'save_future'; });
    } else {
      filtered = allCategories.filter(function(c) { return !deletedCategories[c.id] && c.type === 'save_booking'; });
    }
  }
  filtered.forEach(function(cat) {
    var currentBudget = cat.budget || cat.target || 0;
    var threshold = customThresholds[cat.id] || cat.alertThreshold || 80;
    var showThreshold = (threshold !== globalNotificationThreshold);
    var currency = categoryCurrencies[cat.id] || 'COP';
    var typeLabel = '';
    if (cat.type === 'income') typeLabel = t('income');
    else if (cat.type === 'expense') typeLabel = t('expense');
    else if (cat.type === 'save_future') typeLabel = t('future_savings_short');
    else if (cat.type === 'save_booking') typeLabel = t('booking_short');
    
    list.innerHTML += `
      <div class="budget-item" data-cat-id="${cat.id}">
        <div class="budget-info">
          <span class="icon"${categoryIconBadgeStyle(cat.id)}>${cat.icon}</span>
          <div>
            <span class="name">${cat.name}</span>
            <span style="font-size:11px; color:#8a8a8a; display:block;">${typeLabel}</span>
          </div>
        </div>
        <div class="budget-amount">
          <input type="text" id="budget_${cat.id}" value="${formatMoneyInput(currentBudget)}" min="0" step="1000" onfocus="this.select()" oninput="formatThousandInput(this)">
          <select class="currency-selector" onchange="updateBudgetCurrency('${cat.id}', this.value)" style="padding:4px 8px; border-radius:8px; border:2px solid #eaeaea; font-weight:600; font-size:12px; background:#fff;">
            ${buildCurrencyOptionsHtml(currency)}
          </select>
          <button class="budget-edit-btn" onclick="openCustomSlider('${cat.id}')">✏️</button>
          <span class="threshold-indicator ${showThreshold ? '' : 'hidden'}" style="font-size:11px; color:#007aff; font-weight:600; min-width:35px;">${threshold}%</span>
        </div>
      </div>
    `;
  });
};
window.renderBudgets = renderBudgets;

const filterBudgetCategories = function() {
  var query = normalizeSearchText(document.getElementById('budgetSearchInput').value);
  var items = document.querySelectorAll('#budgetsList .budget-item');
  items.forEach(function(item) {
    var name = normalizeSearchText(item.querySelector('.name').textContent);
    item.style.display = name.includes(query) ? 'flex' : 'none';
  });
};
window.filterBudgetCategories = filterBudgetCategories;

const searchCategoriesInBudgets = function() {
  var searchDiv = document.getElementById('budgetCategorySearch');
  if (searchDiv.style.display === 'none') {
    searchDiv.style.display = 'block';
    document.getElementById('budgetSearchInput').focus();
  } else {
    searchDiv.style.display = 'none';
    document.getElementById('budgetSearchInput').value = '';
    filterBudgetCategories();
  }
};
window.searchCategoriesInBudgets = searchCategoriesInBudgets;

const saveAllBudgets = function() {
  allCategories.forEach(function(cat) {
    if(cat.type === 'expense' || cat.type === 'save_future' || cat.type === 'income' || cat.type === 'save_booking') {
      var input = document.getElementById('budget_' + cat.id);
      if(input) {
        var val = parseFloat(input.value.replace(/,/g, '')) || 0;
        if(cat.type === 'expense' || cat.type === 'income') {
          cat.budget = val;
        } else {
          cat.target = val;
        }
      }
    }
  });
  renderBudgets();
  closeBudgets();
  alertedCategories = {};
  renderApp();
  scheduleGuardarEnFirebase();
};
window.saveAllBudgets = saveAllBudgets;

