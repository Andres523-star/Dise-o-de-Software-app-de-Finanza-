// ===== SCRIPTS (TODA LA LÓGICA DE TU APP) =====
// ===== VARIABLES GLOBALES =====
let isUSD = false; // se mantiene solo por compatibilidad con backups viejos; la fuente de verdad es primaryCurrency
let exchangeRate = parseFloat(localStorage.getItem('exchangeRate_v28')) || 3250;
let currentMonth = 'July';
let categoryFilter = null; 
let typeFilter = 'expense';
let mainSaveView = 'future';

let txType = 'expense'; 
let modalCurrency = 'COP';
let selCatId = null;
let saveSubType = 'gastos_futuros';
let mainAccType = 'Efectivo';
let selSubCard = 'Nu';
let accordionOpen = false;
let detailMode = 'cards';
let editingTxId = null;
let currentTxTags = [];
let language = 'en';
let pendingEmojiCallback = null;
let customSliderTargetId = null;
let globalNotificationThreshold = 80;


// Variables para las pestañas de Presupuestos (Fase 4)
let currentBudgetTab = 'expense';   // 'expense' | 'income' | 'save'
let currentBudgetSub = 'future';    // 'future' | 'booking' (solo cuando currentBudgetTab === 'save')

// Moneda por categoría (para presupuestos y ahorros)
let categoryCurrencies = {};
try {
  const storedCurr = localStorage.getItem('categoryCurrencies_v28');
  if (storedCurr) {
    categoryCurrencies = JSON.parse(storedCurr);
  }
} catch(e) { categoryCurrencies = {}; }

// Variable para editar categoría de ahorro (⋮)
let editingSavingsCategoryId = null;
let editingSavingsEmoji = '📌';

let wizardType = 'expense';
let wizardSaveType = 'gastos_futuros';
let wizardEmoji = '📌';

let addWizardType = 'expense';
let addWizardReturnContext = 'add';
let addWizardSaveType = 'gastos_futuros';
let addWizardEmoji = '📌';

let previousModalIdBeforeCardWizard = null;

let deletedCategories = {};
try {
  const stored = localStorage.getItem('deletedCategories_v28');
  if (stored) {
    deletedCategories = JSON.parse(stored);
  }
} catch(e) { deletedCategories = {}; }

let categoryColors = {};
try {
  const storedColors = localStorage.getItem('categoryColors_v28');
  if (storedColors) {
    categoryColors = JSON.parse(storedColors);
  }
} catch(e) { categoryColors = {}; }

// Color del círculo/ícono de cada categoría (distinto de categoryColors, que
// es el color de la alerta de progreso — este es solo estético).
let categoryIconColors = {};
try {
  const storedIconColors = localStorage.getItem('categoryIconColors_v1');
  if (storedIconColors) {
    categoryIconColors = JSON.parse(storedIconColors);
  }
} catch(e) { categoryIconColors = {}; }

function categoryIconBadgeStyle(catId) {
  var color = categoryIconColors[catId];
  return color ? ' style="background:' + color + ';"' : '';
}

// Color de cada tarjeta (se guarda por nombre, ya que las tarjetas son solo
// strings en myCards — si renombras una tarjeta, su color se conserva).
let cardColors = {};
const CASH_ACCENT_COLOR = '#0E9F6E';
function textoLegibleSobre(hex) {
  if (!hex) return '#1a1a1a';
  var h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(function(c) { return c + c; }).join('');
  var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
  var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1a1a1a' : '#ffffff';
}
try {
  const storedCardColors = localStorage.getItem('cardColors_v1');
  if (storedCardColors) {
    cardColors = JSON.parse(storedCardColors);
  }
} catch(e) { cardColors = {}; }

// notifiedMilestones antes solo vivía en memoria: se reiniciaba cada vez que
// se abría la app, así que "celebraba" de nuevo metas ya notificadas
// (esto era la otra mitad del bug de las notificaciones falsas). Ahora se
// guarda en localStorage.
let notifiedMilestones = {};
try {
  var storedMilestones = localStorage.getItem('notifiedMilestones_v28');
  if (storedMilestones) {
    notifiedMilestones = JSON.parse(storedMilestones);
  }
} catch(e) { notifiedMilestones = {}; }

const saveNotifiedMilestones = function() {
  try {
    localStorage.setItem('notifiedMilestones_v28', JSON.stringify(notifiedMilestones));
  } catch(e) { console.warn('No se pudo guardar notifiedMilestones', e); }
};

let contractingCardId = null;
let loaderInterval = null;
let holdTimeout = null;
let holdStarted = false;
let futureGlobalThreshold = 80;

let selectedDate = new Date();
let datePickerMonth = new Date().getMonth();
let datePickerYear = new Date().getFullYear();
let selectedDay = new Date().getDate();
let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();
let datePickerBtnLabel = 'Today';
let dateTouched = false;
let dateUserPicked = false;
let takeFromBalance = false;

let currentDeletedGoalId = null;

const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const emojis = ['📌', '💼', '🎁', '🔔', '💎', '🛍️', '👖', '✈️', '🛒', '🏦', '💰', '🍕', '☕', '🎮', '📱', '💻', '🎵', '📚', '🎬', '🏠', '🚗', '🎓', '💊', '🏥', '🎨', '⚽', '🎯', '🎪',
'🍔', '🍟', '🌮', '🍣', '🍦', '🍩', '🍻', '🥂', '🥦', '🥩', '🍜', '🍱', '🍝', '🥪', '🍿', '🧋', '🍺', '🍷', '🥃', '🍎', '🍇', '🥑', '🥗', '🥕', '🍳', '🧁',
'👕', '👗', '👟', '👠', '👓', '⌚', '🧢', '👜', '🩳', '🧥', '👔', '💍', '🕶️',
'🚌', '🚕', '🚂', '🚲', '⛽', '🚆', '🚇', '🛵', '🛴', '🚙', '🚢', '🛳️', '🚁', '🚀', '🅿️',
'🐶', '🐱', '🐾', '🐦', '🐠', '🐹',
'💡', '🚰', '🔌', '🗑️', '🧹', '🛋️', '🛏️', '🚪', '🧺', '🔧',
'🏋️', '🧘', '🎾', '🏀', '🏈', '⚾', '🏐', '🏓', '🚴', '🏊', '🥊', '🧗',
'💄', '💈', '🧴', '💅', '🧖', '🪒', '🧼',
'📈', '📉', '💵', '💶', '💷', '💴', '💳', '🧾', '🏧', '📊', '🪙', '💹', '🧮',
'🎉', '🎈', '🎂', '💌', '👶', '🧸', '🛠️', '📸', '🎧', '🎁', '🎃', '🎄', '🕯️', '💒', '👰', '🤵',
'🏢', '🏭', '🏬', '🏪', '🏨', '🏦', '📇', '🖥️', '🖨️', '📞', '☎️', '📠', '📝', '📎', '🖇️', '📁', '📂', '🗂️', '🗓️', '📅', '🖋️', '✒️', '📐', '📏', '🔍', '🤝', '👔', '🧑‍💼', '👩‍💼', '🧑‍💻', '💡',
'🗺️', '🧳', '🎒', '⛺', '🏖️', '🏝️', '🏔️', '⛷️', '🏄', '🛶', '🎡', '🎢', '🗼', '🗽', '🕌', '⛩️', '🏛️', '🛂', '🧭', '🌍', '🌎', '🌏', '🛫', '🛬',
'🐮', '🌾', '🚜', '⚕️', '🩺', '💉', '🦷', '👓', '🧠', '🩹',
'🎼', '🎹', '🎸', '🥁', '🎤', '🎻', '🎺', '🖌️', '🖼️', '🎭'];

const emojiKeywords = {
  'comida': ['🍕', '🍔', '🌮', '🍣', '🥩', '🥦', '🍩', '☕', '🍻', '🍜', '🍱'],
  'food': ['🍕', '🍔', '🌮', '🍣', '🥩', '🥦', '🍩', '☕', '🍜'],
  'restaurante': ['🍽️', '🍕', '🍔', '🍣', '🍝', '🥗'],
  'restaurant': ['🍽️', '🍕', '🍔', '🍣', '🍝', '🥗'],
  'cafe': ['☕', '🧋', '🍰'],
  'coffee': ['☕', '🧋', '🍰'],
  'bebida': ['🍺', '🍷', '🥃', '🍻', '🧋'],
  'drink': ['🍺', '🍷', '🥃', '🍻', '🧋'],
  'vegetal': ['🥦', '🥕', '🥬', '🌽', '🥗'],
  'vegetable': ['🥦', '🥕', '🥬', '🌽', '🥗'],
  'super': ['🛒', '🥑', '🍎', '🥕'],
  'supermercado': ['🛒', '🥑', '🍎', '🥕'],
  'groceries': ['🛒', '🥑', '🍎', '🥕'],
  'business': ['💼', '📈', '🏢', '🤝', '📊', '💻', '🧑‍💼'],
  'negocio': ['💼', '📈', '🏢', '🤝', '📊', '💻', '🧑‍💼'],
  'negocios': ['💼', '📈', '🏢', '🤝', '📊', '💻', '🧑‍💼'],
  'empresa': ['🏢', '💼', '📊', '🤝'],
  'company': ['🏢', '💼', '📊', '🤝'],
  'oficina': ['🏢', '🖥️', '📎', '🗂️'],
  'office': ['🏢', '🖥️', '📎', '🗂️'],
  'reunion': ['🤝', '💼', '📅'],
  'meeting': ['🤝', '💼', '📅'],
  'venta': ['📈', '💵', '🛍️', '🧾'],
  'sale': ['📈', '💵', '🛍️', '🧾'],
  'proveedor': ['🚚', '📦', '🤝'],
  'supplier': ['🚚', '📦', '🤝'],
  'inventario': ['📦', '🗃️', '📊'],
  'inventory': ['📦', '🗃️', '📊'],
  'marketing': ['📣', '📊', '💻'],
  'publicidad': ['📣', '📊', '💻'],
  'work': ['💼', '💻', '🔨', '👷'],
  'trabajo': ['💼', '💻', '🔨', '👷'],
  'regalo': ['🎁', '🎉', '🎈', '🎂', '💌'],
  'gift': ['🎁', '🎉', '🎈', '🎂', '💌'],
  'cumpleaños': ['🎂', '🎉', '🎈', '🎁'],
  'birthday': ['🎂', '🎉', '🎈', '🎁'],
  'boda': ['💒', '👰', '🤵', '💍'],
  'wedding': ['💒', '👰', '🤵', '💍'],
  'navidad': ['🎄', '🎁', '🕯️'],
  'christmas': ['🎄', '🎁', '🕯️'],
  'finanzas': ['🏦', '💰', '📈', '💵', '💳', '🧾'],
  'finance': ['🏦', '💰', '📈', '💵', '💳', '🧾'],
  'ahorro': ['🏦', '💰', '💎', '🪙'],
  'save': ['🏦', '💰', '💎', '🪙'],
  'inversion': ['📈', '💹', '💰', '📊'],
  'investment': ['📈', '💹', '💰', '📊'],
  'impuesto': ['🧾', '🏦', '📄'],
  'tax': ['🧾', '🏦', '📄'],
  'prestamo': ['🏦', '💳', '🧾'],
  'loan': ['🏦', '💳', '🧾'],
  'ropa': ['👕', '👖', '👗', '👟', '👠', '👓', '🧥'],
  'clothes': ['👕', '👖', '👗', '👟', '👠', '👓', '🧥'],
  'zapatos': ['👟', '👠'],
  'shoes': ['👟', '👠'],
  'accesorio': ['⌚', '👜', '🕶️', '💍'],
  'accessory': ['⌚', '👜', '🕶️', '💍'],
  'transporte': ['🚌', '🚕', '🚗', '✈️', '🚂', '⛽', '🚲', '🛵'],
  'transport': ['🚌', '🚕', '🚗', '✈️', '🚂', '⛽', '🛵'],
  'gasolina': ['⛽', '🚗'],
  'gas': ['⛽', '🚗'],
  'carro': ['🚗', '🚙', '⛽'],
  'car': ['🚗', '🚙', '⛽'],
  'moto': ['🛵', '🏍️'],
  'bicicleta': ['🚲'],
  'bike': ['🚲'],
  'taxi': ['🚕', '🚙'],
  'uber': ['🚕', '🚙'],
  'parqueadero': ['🅿️', '🚗'],
  'parking': ['🅿️', '🚗'],
  'casa': ['🏠', '💡', '🚰', '🔌', '🗑️', '🛋️'],
  'home': ['🏠', '💡', '🚰', '🔌', '🗑️', '🛋️'],
  'arriendo': ['🏠', '🔑', '🧾'],
  'renta': ['🏠', '🔑', '🧾'],
  'rent': ['🏠', '🔑', '🧾'],
  'muebles': ['🛋️', '🛏️', '🪑'],
  'furniture': ['🛋️', '🛏️', '🪑'],
  'servicios': ['💡', '🚰', '🔌', '🧾'],
  'utilities': ['💡', '🚰', '🔌', '🧾'],
  'salud': ['💊', '🏥', '🧴', '🏋️', '🧘', '🩺'],
  'health': ['💊', '🏥', '🧴', '🏋️', '🧘', '🩺'],
  'medico': ['🩺', '🏥', '💊'],
  'doctor': ['🩺', '🏥', '💊'],
  'dentista': ['🦷', '🏥'],
  'dentist': ['🦷', '🏥'],
  'gym': ['🏋️', '🧘', '🚴'],
  'gimnasio': ['🏋️', '🧘', '🚴'],
  'mascota': ['🐶', '🐱', '🐾'],
  'pet': ['🐶', '🐱', '🐾'],
  'perro': ['🐶', '🐾'],
  'dog': ['🐶', '🐾'],
  'gato': ['🐱', '🐾'],
  'cat': ['🐱', '🐾'],
  'ocio': ['🎮', '🎬', '🎪', '🎨', '📚', '🎧'],
  'entertainment': ['🎮', '🎬', '🎪', '🎨', '📚', '🎧'],
  'cine': ['🎬', '🍿'],
  'movie': ['🎬', '🍿'],
  'musica': ['🎵', '🎧', '🎸', '🎤'],
  'music': ['🎵', '🎧', '🎸', '🎤'],
  'juego': ['🎮', '🎲'],
  'game': ['🎮', '🎲'],
  'fiesta': ['🎉', '🎈', '🥂'],
  'party': ['🎉', '🎈', '🥂'],
  'viaje': ['✈️', '🚗', '🗺️', '📸', '🧳', '🎒'],
  'travel': ['✈️', '🚗', '🗺️', '📸', '🧳', '🎒'],
  'vacaciones': ['🏖️', '🏝️', '🧳', '☀️'],
  'vacation': ['🏖️', '🏝️', '🧳', '☀️'],
  'hotel': ['🏨', '🛏️'],
  'vuelo': ['✈️', '🛫', '🛬'],
  'flight': ['✈️', '🛫', '🛬'],
  'playa': ['🏖️', '🏝️', '🌊'],
  'beach': ['🏖️', '🏝️', '🌊'],
  'montaña': ['🏔️', '⛷️', '🧗'],
  'mountain': ['🏔️', '⛷️', '🧗'],
  'camping': ['⛺', '🧭'],
  'crucero': ['🛳️', '🚢'],
  'cruise': ['🛳️', '🚢'],
  'pasaporte': ['🛂', '🧳'],
  'passport': ['🛂', '🧳'],
  'estudio': ['🎓', '📚', '💻'],
  'study': ['🎓', '📚', '💻'],
  'universidad': ['🎓', '📚'],
  'university': ['🎓', '📚'],
  'colegio': ['🎓', '📚', '✏️'],
  'school': ['🎓', '📚', '✏️'],
  'curso': ['🎓', '📚', '💻'],
  'course': ['🎓', '📚', '💻'],
  'belleza': ['💄', '💈', '🧴', '💅'],
  'beauty': ['💄', '💈', '🧴', '💅'],
  'peluqueria': ['💈', '✂️'],
  'salon': ['💈', '💅'],
  'tecnologia': ['💻', '📱', '🖥️', '🖨️'],
  'technology': ['💻', '📱', '🖥️', '🖨️'],
  'tech': ['💻', '📱', '🖥️', '🖨️'],
  'reloj': ['⌚', '🕰️'],
  'watch': ['⌚', '🕰️'],
  'apple watch': ['⌚', '🍎'],
  'applewatch': ['⌚', '🍎'],
  'apple': ['🍎', '📱', '💻', '⌚'],
  'iphone': ['📱', '🍎'],
  'ipad': ['📱', '🍎'],
  'macbook': ['💻', '🍎'],
  'airpods': ['🎧', '🍎'],
  'celular': ['📱', '☎️'],
  'phone': ['📱', '☎️'],
  'smartphone': ['📱'],
  'telefono': ['📱', '☎️'],
  'computador': ['💻', '🖥️'],
  'computadora': ['💻', '🖥️'],
  'laptop': ['💻'],
  'tablet': ['📱', '💻'],
  'auriculares': ['🎧'],
  'headphones': ['🎧'],
  'camara': ['📷', '📸'],
  'camera': ['📷', '📸'],
  'television': ['📺'],
  'tv': ['📺'],
  'consola': ['🎮', '🕹️'],
  'videojuegos': ['🎮', '🕹️'],
  'gaming': ['🎮', '🕹️'],
  'videojuego': ['🎮', '🕹️'],
  'spotify': ['🎵', '🎧', '🎤', '🔁'],
  'apple music': ['🎵', '🎧', '🍎', '🔁'],
  'applemusic': ['🎵', '🎧', '🍎', '🔁'],
  'youtube': ['📺', '▶️', '🎬'],
  'youtube premium': ['📺', '▶️', '🎬'],
  'netflix': ['🎬', '📺', '🍿'],
  'disney': ['🏰', '🎬', '📺'],
  'disney+': ['🏰', '🎬', '📺'],
  'hbo': ['🎬', '📺'],
  'hbo max': ['🎬', '📺'],
  'max': ['🎬', '📺'],
  'amazon': ['📦', '🛒'],
  'amazon prime': ['📦', '🎬', '🚚'],
  'prime video': ['🎬', '📺'],
  'icloud': ['☁️', '📱', '🍎'],
  'google one': ['☁️', '📱'],
  'apple tv': ['📺', '🍎'],
  'twitch': ['🎮', '📺'],
  'deezer': ['🎵', '🎧'],
  'tidal': ['🎵', '🎧'],
  'gympass': ['🏋️', '🧘'],
  'gym pass': ['🏋️', '🧘'],
  'suscripcion': ['🔁', '📅', '💳'],
  'suscripción': ['🔁', '📅', '💳'],
  'subscription': ['🔁', '📅', '💳']
};

const countryFlags = {
  'colombia': '🇨🇴', 'estados unidos': '🇺🇸', 'usa': '🇺🇸', 'united states': '🇺🇸', 'eeuu': '🇺🇸',
  'mexico': '🇲🇽', 'méxico': '🇲🇽', 'espana': '🇪🇸', 'españa': '🇪🇸', 'spain': '🇪🇸',
  'argentina': '🇦🇷', 'brasil': '🇧🇷', 'brazil': '🇧🇷', 'chile': '🇨🇱', 'peru': '🇵🇪', 'perú': '🇵🇪',
  'ecuador': '🇪🇨', 'venezuela': '🇻🇪', 'bolivia': '🇧🇴', 'paraguay': '🇵🇾', 'uruguay': '🇺🇾',
  'panama': '🇵🇦', 'panamá': '🇵🇦', 'costa rica': '🇨🇷', 'cuba': '🇨🇺', 'republica dominicana': '🇩🇴', 'república dominicana': '🇩🇴',
  'guatemala': '🇬🇹', 'honduras': '🇭🇳', 'nicaragua': '🇳🇮', 'el salvador': '🇸🇻',
  'canada': '🇨🇦', 'canadá': '🇨🇦', 'francia': '🇫🇷', 'france': '🇫🇷', 'italia': '🇮🇹', 'italy': '🇮🇹',
  'alemania': '🇩🇪', 'germany': '🇩🇪', 'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'england': '🇬🇧', 'united kingdom': '🇬🇧', 'uk': '🇬🇧',
  'portugal': '🇵🇹', 'holanda': '🇳🇱', 'paises bajos': '🇳🇱', 'netherlands': '🇳🇱',
  'suiza': '🇨🇭', 'switzerland': '🇨🇭', 'suecia': '🇸🇪', 'sweden': '🇸🇪', 'noruega': '🇳🇴', 'norway': '🇳🇴',
  'grecia': '🇬🇷', 'greece': '🇬🇷', 'turquia': '🇹🇷', 'turquía': '🇹🇷', 'turkey': '🇹🇷',
  'rusia': '🇷🇺', 'russia': '🇷🇺', 'china': '🇨🇳', 'japon': '🇯🇵', 'japón': '🇯🇵', 'japan': '🇯🇵',
  'corea': '🇰🇷', 'korea': '🇰🇷', 'india': '🇮🇳', 'tailandia': '🇹🇭', 'thailand': '🇹🇭',
  'vietnam': '🇻🇳', 'indonesia': '🇮🇩', 'filipinas': '🇵🇭', 'philippines': '🇵🇭', 'singapur': '🇸🇬', 'singapore': '🇸🇬',
  'australia': '🇦🇺', 'nueva zelanda': '🇳🇿', 'new zealand': '🇳🇿',
  'egipto': '🇪🇬', 'egypt': '🇪🇬', 'marruecos': '🇲🇦', 'morocco': '🇲🇦', 'sudafrica': '🇿🇦', 'sudáfrica': '🇿🇦', 'south africa': '🇿🇦',
  'emiratos': '🇦🇪', 'dubai': '🇦🇪', 'israel': '🇮🇱', 'irlanda': '🇮🇪', 'ireland': '🇮🇪',
  'polonia': '🇵🇱', 'poland': '🇵🇱', 'austria': '🇦🇹', 'belgica': '🇧🇪', 'bélgica': '🇧🇪', 'belgium': '🇧🇪'
};

const detectFlags = function(text) {
  var found = [];
  for (var name in countryFlags) {
    if (text.includes(name)) found.push(countryFlags[name]);
  }
  return found;
};

const suggestEmojis = function(text, containerId, displayId) {
  const container = document.getElementById(containerId);
  var rawText = text.toLowerCase().trim();
  var normText = normalizeSearchText(text);
  container.innerHTML = '';
  if(!normText) {
    container.classList.remove('visible');
    return;
  }
  let matchedEmojis = new Set();
  let foundMatch = false;
  detectFlags(rawText).forEach(function(flag) { matchedEmojis.add(flag); foundMatch = true; });

  // Se separa en palabras sueltas para que "Apple Watch" encuentre la clave
  // "watch" o "apple" aunque no exista una clave exacta "apple watch", y sin
  // importar tildes (normalizeSearchText).
  var words = normText.split(/\s+/).filter(function(w) { return w.length > 0; });

  for (let key in emojiKeywords) {
    var normKey = normalizeSearchText(key);
    var wholeMatch = normText.includes(normKey) || normKey.includes(normText);
    var wordMatch = words.some(function(w) {
      return w === normKey || (w.length >= 3 && normKey.includes(w)) || (normKey.length >= 3 && w.includes(normKey));
    });
    if (wholeMatch || wordMatch) {
      emojiKeywords[key].forEach(e => matchedEmojis.add(e));
      foundMatch = true;
    }
  }
  if (!foundMatch) {
    ['✨', '🔹', '📌', '💡', '⭐', '🔥'].forEach(e => matchedEmojis.add(e));
  }
  Array.from(matchedEmojis).forEach(emoji => {
    const btn = document.createElement('span');
    btn.className = 'suggested-emoji-btn';
    btn.innerText = emoji;
    btn.onclick = function() {
      document.getElementById(displayId).innerText = emoji;
      if(displayId === 'wizardEmojiDisplay') wizardEmoji = emoji;
      if(displayId === 'addWizardEmojiDisplay') addWizardEmoji = emoji;
      if(displayId === 'recurringEmojiDisplay') recurringEmoji = emoji;
    };
    container.appendChild(btn);
  });
  container.classList.add('visible');
};

const allCategories = [
  { id: 'inc_work', name: 'Work', icon: '💼', type: 'income', budget: 0, alertThreshold: 80 },
  { id: 'inc_gift', name: 'Gift', icon: '🎁', type: 'income', budget: 0, alertThreshold: 80 },
  { id: 'inc_freelance', name: 'Freelance', icon: '💻', type: 'income', budget: 0, alertThreshold: 80 },
  { id: 'inc_investment', name: 'Investment', icon: '📈', type: 'income', budget: 0, alertThreshold: 80 },
  { id: 'inc_carryover', name: 'Saldo Inicial', icon: '💰', type: 'income', budget: 0, alertThreshold: 80 },
  { id: 'exp_carryover', name: 'Saldo Inicial', icon: '📉', type: 'expense', budget: 0, alertThreshold: 80 },
  { id: 'exp_sub', name: 'Subscriptions', icon: '🔔', type: 'expense', budget: 0, alertThreshold: 80 },
  { id: 'exp_lux', name: 'Luxury', icon: '💎', type: 'expense', budget: 0, alertThreshold: 80 },
  { id: 'exp_shop', name: 'Shopping', icon: '🛍️', type: 'expense', budget: 0, alertThreshold: 80 },
  { id: 'exp_clothes', name: 'Clothes', icon: '👖', type: 'expense', budget: 250000, alertThreshold: 80 },
  { id: 'exp_food', name: 'Food', icon: '🍕', type: 'expense', budget: 0, alertThreshold: 80 },
  { id: 'exp_transport', name: 'Transport', icon: '🚗', type: 'expense', budget: 0, alertThreshold: 80 },
  { id: 'exp_entertainment', name: 'Entertainment', icon: '🎮', type: 'expense', budget: 0, alertThreshold: 80 },
  { id: 'goal_viaje', name: 'Travel', icon: '✈️', type: 'save_future', target: 5000000, alertThreshold: 80 },
  { id: 'goal_carrito', name: 'Shopping Cart', icon: '🛒', type: 'save_future', target: 200000, alertThreshold: 80 },
  { id: 'goal_personal', name: 'Personal Savings', icon: '🏦', type: 'save_future', target: 0, alertThreshold: 80 },
  { id: 'goal_house', name: 'House', icon: '🏠', type: 'save_future', target: 10000000, alertThreshold: 80 },
  { id: 'goal_car', name: 'Car', icon: '🚗', type: 'save_future', target: 8000000, alertThreshold: 80 },
  { id: 'sav_booking', name: 'Booking', icon: '💰', type: 'save_booking', target: 0, alertThreshold: 80 },
  { id: 'sav_booking_thrii', name: 'Thrii', icon: '🏦', type: 'save_booking', target: 0, alertThreshold: 80 },
  { id: 'sav_booking_happy', name: 'Happy', icon: '🎯', type: 'save_booking', target: 0, alertThreshold: 80 }
];

let myCards = ['Nu', 'Nequi', 'DolarApp'];

// FASE 2: guardamos una "foto" de las categorías/tarjetas de fábrica ANTES de
// que se sobreescriban con lo que haya en localStorage. Así, cuando el
// usuario crea un tablero nuevo, ese tablero arranca limpio (con las
// categorías por defecto) y no con las del tablero que estaba viendo.
const DEFAULT_CATEGORIES_SNAPSHOT = JSON.parse(JSON.stringify(allCategories));
const DEFAULT_CARDS_SNAPSHOT = myCards.slice();

try {
  var storedCats = localStorage.getItem('allCategories_v29');
  if (storedCats) {
    var parsedCats = JSON.parse(storedCats);
    allCategories.length = 0;
    parsedCats.forEach(function(c) { allCategories.push(c); });
  }
} catch(e) {}

try {
  var storedCards = localStorage.getItem('myCards_v29');
  if (storedCards) myCards = JSON.parse(storedCards);
} catch(e) {}

try {
  var storedIsUSD = localStorage.getItem('isUSD_v29');
  if (storedIsUSD !== null) isUSD = (storedIsUSD === 'true');
} catch(e) {}

try {
  var storedLang = localStorage.getItem('language_v29');
  if (storedLang) {
    language = storedLang;
  } else {
    // Primera vez que se abre la app en este dispositivo: se detecta el
    // idioma del celular en vez de usar 'en' por defecto.
    var idiomaDispositivo = (navigator.language || navigator.userLanguage || 'en');
    language = idiomaDispositivo.toLowerCase().startsWith('es') ? 'es' : 'en';
  }
} catch(e) {}
try { applyTranslations(); } catch (e) {} // traduce el onboarding (welcome, q1-q3, auth) desde ya

const saveAppStateToStorage = function() {
  try {
    localStorage.setItem('transactions_v29', JSON.stringify(transactions));
    localStorage.setItem('allCategories_v29', JSON.stringify(allCategories));
    localStorage.setItem('myCards_v29', JSON.stringify(myCards));
    localStorage.setItem('isUSD_v29', String(isUSD));
    localStorage.setItem('language_v29', language);
  } catch(e) {}
};

window.exportAppData = function() {
  var backup = {
    version: 29,
    exportedAt: new Date().toISOString(),
    transactions: transactions,
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
    recurringCharges: recurringCharges,
    negativeBalanceAlert: negativeBalanceAlert,
    appLastSeenMonthIdx: localStorage.getItem('appLastSeenMonthIdx_v28'),
    appLastSeenYear: localStorage.getItem('appLastSeenYear_v28'),
    exchangeRate: exchangeRate
  };
  var blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var todayStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'backup-finanzas-' + todayStr + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showCustomAlert('📤', 'Datos exportados', 'Guarda ese archivo. Cuando abras una nueva versión del HTML, usa "Importar mis datos" para traer todo de vuelta.');
};

window.importAppData = function(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var backup = JSON.parse(e.target.result);
      if (backup.transactions) localStorage.setItem('transactions_v29', JSON.stringify(backup.transactions));
      if (backup.allCategories) localStorage.setItem('allCategories_v29', JSON.stringify(backup.allCategories));
      if (backup.myCards) localStorage.setItem('myCards_v29', JSON.stringify(backup.myCards));
      if (backup.isUSD !== undefined) localStorage.setItem('isUSD_v29', String(backup.isUSD));
      if (backup.primaryCurrency) localStorage.setItem('primaryCurrency_v1', backup.primaryCurrency);
      if (backup.secondaryCurrencies) localStorage.setItem('secondaryCurrencies_v1', JSON.stringify(backup.secondaryCurrencies));
      if (backup.language) localStorage.setItem('language_v29', backup.language);
      if (backup.deletedCategories) localStorage.setItem('deletedCategories_v28', JSON.stringify(backup.deletedCategories));
      if (backup.categoryColors) localStorage.setItem('categoryColors_v28', JSON.stringify(backup.categoryColors));
      if (backup.categoryIconColors) localStorage.setItem('categoryIconColors_v1', JSON.stringify(backup.categoryIconColors));
      if (backup.cardColors) localStorage.setItem('cardColors_v1', JSON.stringify(backup.cardColors));
      if (backup.recurringCharges) localStorage.setItem('recurringCharges_v28', JSON.stringify(backup.recurringCharges));
      if (backup.negativeBalanceAlert) localStorage.setItem('negativeBalanceAlert_v28', JSON.stringify(backup.negativeBalanceAlert));
      if (backup.appLastSeenMonthIdx) localStorage.setItem('appLastSeenMonthIdx_v28', backup.appLastSeenMonthIdx);
      if (backup.appLastSeenYear) localStorage.setItem('appLastSeenYear_v28', backup.appLastSeenYear);
      if (backup.exchangeRate) localStorage.setItem('exchangeRate_v28', String(backup.exchangeRate));
      alert('Datos importados. La app se va a recargar ahora.');
      location.reload();
    } catch(err) {
      showCustomAlert('⚠️', 'Archivo inválido', 'No pudimos leer ese archivo de respaldo. Asegúrate de elegir el JSON que exportaste desde esta misma app.');
    }
  };
  reader.readAsText(file);
};

let recurringCharges = [];
try {
  const storedRecurring = localStorage.getItem('recurringCharges_v28');
  if (storedRecurring) recurringCharges = JSON.parse(storedRecurring);
} catch(e) { recurringCharges = []; }

let recurringEditId = null;
let recurringEmoji = '🔁';
let recurringCurrency = 'COP';
let recurringMode = 'reminder';
let recurringSelectedCard = 'Nu';
let recurringTxType = 'expense';
let recurringCatId = 'exp_sub';
let recurringSaveSubType = 'gastos_futuros';
let recurringPayMethod = 'card';
let recurringFreq = 'month';
let recurringCustomValue = 5;
let recurringCustomUnit = 'days';
let recurringDateOpen = false;

let recurringSelectedDateISO = null;
let recurringCalYear = new Date().getFullYear();
let recurringCalMonth = new Date().getMonth();

let recurringNotifications = [];
let recurringNotifyCalendarOpen = false;
let recurringNotifyCalYear = new Date().getFullYear();
let recurringNotifyCalMonth = new Date().getMonth();

const saveRecurringChargesToStorage = function() {
  localStorage.setItem('recurringCharges_v28', JSON.stringify(recurringCharges));
};

let negativeBalanceAlert = null;
try {
  const storedNBA = localStorage.getItem('negativeBalanceAlert_v28');
  if (storedNBA) negativeBalanceAlert = JSON.parse(storedNBA);
} catch(e) { negativeBalanceAlert = null; }

let pendingRolloverAmount = 0;
let pendingRolloverMonth = null;

let transactions = [
  { id: 1, month: 'July', type: 'expense', catId: 'exp_sub', title: 'iCloud', amount: 12900, accStr: 'Nequi', date: '5 Jul' },
  { id: 2, month: 'July', type: 'expense', catId: 'exp_sub', title: 'Apple Music', amount: 8500, accStr: 'Nu', date: '6 Jul' },
  { id: 3, month: 'July', type: 'expense', catId: 'exp_shop', title: 'Clothes', amount: 62000, accStr: 'Nu', date: '12 Jul' },
  { id: 4, month: 'July', type: 'income', catId: 'inc_work', title: 'Project Payment', amount: 100000, accStr: 'Cash', date: '15 Jul' },
  { id: 5, month: 'July', type: 'expense', catId: 'exp_clothes', title: 'Pants', amount: 250000, accStr: 'Nu', date: '20 Jul' },
  { id: 6, month: 'July', type: 'save', catId: 'goal_viaje', title: 'Travel Savings', amount: 50000, accStr: 'Nu', date: '22 Jul' },
  { id: 7, month: 'July', type: 'expense', catId: 'exp_clothes', title: 'Zara Shirt', amount: 85000, accStr: 'Nequi', date: '25 Jul' },
  { id: 8, month: 'July', type: 'expense', catId: 'exp_food', title: 'Lunch', amount: 15000, accStr: 'Cash', date: '26 Jul' },
  { id: 9, month: 'July', type: 'expense', catId: 'exp_food', title: 'Dinner', amount: 25000, accStr: 'Nu', date: '27 Jul' },
  { id: 10, month: 'July', type: 'expense', catId: 'exp_transport', title: 'Taxi', amount: 12000, accStr: 'Nequi', date: '28 Jul' },
  { id: 11, month: 'July', type: 'expense', catId: 'exp_entertainment', title: 'Movies', amount: 18000, accStr: 'Nu', date: '29 Jul' },
  { id: 12, month: 'July', type: 'income', catId: 'inc_freelance', title: 'Freelance Work', amount: 150000, accStr: 'Cash', date: '30 Jul' },
  { id: 13, month: 'July', type: 'income', catId: 'inc_investment', title: 'Investment Return', amount: 30000, accStr: 'DolarApp', date: '31 Jul' },
  { id: 14, month: 'July', type: 'expense', catId: 'exp_lux', title: 'Watch', amount: 120000, accStr: 'Nu', date: '1 Aug' },
  { id: 15, month: 'July', type: 'save', catId: 'goal_house', title: 'House Savings', amount: 100000, accStr: 'Nequi', date: '2 Aug' },
  { id: 16, month: 'July', type: 'save', catId: 'goal_car', title: 'Car Savings', amount: 50000, accStr: 'DolarApp', date: '3 Aug' },
  { id: 17, month: 'July', type: 'save', catId: 'sav_booking', title: 'Booking - Trip', amount: 30000, accStr: 'Nu', date: '4 Aug' },
  { id: 18, month: 'July', type: 'expense', catId: 'exp_sub', title: 'Netflix', amount: 16500, accStr: 'Nu', date: '5 Aug' },
  { id: 19, month: 'July', type: 'expense', catId: 'exp_sub', title: 'Spotify', amount: 7200, accStr: 'Nequi', date: '6 Aug' },
  { id: 20, month: 'July', type: 'income', catId: 'inc_gift', title: 'Birthday Gift', amount: 200000, accStr: 'Cash', date: '7 Aug' },
  { id: 21, month: 'July', type: 'expense', catId: 'exp_shop', title: 'Shoes', amount: 45000, accStr: 'Nu', date: '8 Aug' }
];

try {
  var storedTx = localStorage.getItem('transactions_v29');
  if (storedTx) {
    transactions = JSON.parse(storedTx);
  } else {
    localStorage.setItem('transactions_v29', JSON.stringify(transactions));
  }
} catch(e) {}

const customThresholds = {};
let alertedCategories = {};
let lastActiveModal = null;

const progressMessages = [
  { emoji: '🏆', title: '¡Vas Ganando!', text: 'Has alcanzado el 80% de tu meta de ahorro.' },
  { emoji: '🎯', title: 'En el Blanco', text: 'Has llegado al 80% de tu objetivo de ahorro.' },
  { emoji: '⭐', title: 'Estrella Brillante', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '🚀', title: 'Despegue', text: 'Has alcanzado el 80% de tu meta de ahorro.' },
  { emoji: '🎉', title: 'Celebración', text: 'Has llegado al 80% de tu objetivo de ahorro.' },
  { emoji: '💪', title: 'Fuerza', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '🌈', title: 'Arcoíris', text: 'Has alcanzado el 80% de tu objetivo de ahorro.' },
  { emoji: '✨', title: 'Brillante', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '🥇', title: 'Medalla de Oro', text: 'Has llegado al 80% de tu objetivo de ahorro.' },
  { emoji: '🏅', title: 'Logro Deportivo', text: 'Has alcanzado el 80% de tu meta de ahorro.' },
  { emoji: '🎖️', title: 'Honor', text: 'Has superado el 80% de tu objetivo de ahorro.' },
  { emoji: '🌟', title: 'Estrella', text: 'Has llegado al 80% de tu meta de ahorro.' },
  { emoji: '💎', title: 'Diamante', text: 'Has alcanzado el 80% de tu objetivo de ahorro.' },
  { emoji: '🔮', title: 'Clarividencia', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '🏁', title: 'Meta Cerca', text: 'Has alcanzado el 80% de tu objetivo de ahorro.' },
  { emoji: '🦅', title: 'Águila', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '🔥', title: 'En llamas', text: 'Has llegado al 80% de tu objetivo de ahorro.' },
  { emoji: '⚡', title: 'Rayo', text: 'Has alcanzado el 80% de tu meta de ahorro.' },
  { emoji: '🌋', title: 'Volcán', text: 'Has superado el 80% de tu objetivo de ahorro.' },
  { emoji: '🌠', title: 'Estrella Fugaz', text: 'Has llegado al 80% de tu meta de ahorro.' },
  { emoji: '🎇', title: 'Fuegos Artificiales', text: 'Has alcanzado el 80% de tu objetivo de ahorro.' },
  { emoji: '🏹', title: 'Arco y Flecha', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '⚽', title: 'Gol', text: 'Has marcado el 80% de tu objetivo de ahorro.' },
  { emoji: '🎾', title: 'Ace', text: 'Has alcanzado el 80% de tu meta de ahorro.' },
  { emoji: '🏸', title: 'Volante', text: 'Has superado el 80% de tu objetivo de ahorro.' },
  { emoji: '🏓', title: 'Ping Pong', text: 'Has llegado al 80% de tu meta de ahorro.' },
  { emoji: '🏊', title: 'Nadando', text: 'Has alcanzado el 80% de tu objetivo de ahorro.' },
  { emoji: '🚴', title: 'Ciclista', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '🧗', title: 'Escalador', text: 'Has llegado al 80% de tu objetivo de ahorro.' },
  { emoji: '🏋️', title: 'Pesas', text: 'Has alcanzado el 80% de tu meta de ahorro.' },
  { emoji: '🧘', title: 'Meditación', text: 'Has superado el 80% de tu objetivo de ahorro.' },
  { emoji: '🎶', title: 'Música', text: 'Has llegado al 80% de tu meta de ahorro.' },
  { emoji: '🎵', title: 'Nota Musical', text: 'Has alcanzado el 80% de tu objetivo de ahorro.' },
  { emoji: '🎤', title: 'Micrófono', text: 'Has superado el 80% de tu meta de ahorro.' },
  { emoji: '🎧', title: 'Audífonos', text: 'Has llegado al 80% de tu objetivo de ahorro.' },
  { emoji: '📸', title: 'Fotografía', text: 'Has alcanzado el 80% de tu meta de ahorro.' },
  { emoji: '🎬', title: 'Cine', text: 'Has superado el 80% de tu objetivo de ahorro.' },
  { emoji: '📺', title: 'TV', text: 'Has llegado al 80% de tu meta de ahorro.' },
  { emoji: '💡', title: 'Luz', text: 'Has alcanzado el 80% de tu objetivo de ahorro.' },
  { emoji: '🔦', title: 'Linterna', text: 'Has superado el 80% de tu meta de ahorro.' }
];

const completeMessages = [
  { emoji: '🎊', title: '¡Meta Alcanzada!', text: 'Has logrado el 100% de tu objetivo de ahorro.' },
  { emoji: '🥳', title: 'Fiesta', text: '¡Completaste tu meta de ahorro al 100%!' },
  { emoji: '🏆', title: 'Campeón', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '💎', title: 'Tesoro', text: 'Has logrado el 100% de tu objetivo de ahorro.' },
  { emoji: '🌟', title: 'Estrella', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '🎉', title: 'Celebración', text: 'Has completado el 100% de tu objetivo de ahorro.' },
  { emoji: '🚀', title: 'Despegue', text: 'Has llegado al 100% de tu meta de ahorro.' },
  { emoji: '⭐', title: 'Estrella Brillante', text: 'Has alcanzado el 100% de tu objetivo de ahorro.' },
  { emoji: '🏅', title: 'Medalla de Oro', text: 'Has logrado el 100% de tu meta de ahorro.' },
  { emoji: '🎖️', title: 'Honor', text: 'Has completado el 100% de tu objetivo de ahorro.' },
  { emoji: '🌈', title: 'Arcoíris', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '✨', title: 'Brillante', text: 'Has logrado el 100% de tu objetivo de ahorro.' },
  { emoji: '💪', title: 'Fuerza', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '🎯', title: 'En el Blanco', text: 'Has completado el 100% de tu objetivo de ahorro.' },
  { emoji: '🏁', title: 'Meta Alcanzada', text: 'Has llegado al 100% de tu meta de ahorro.' },
  { emoji: '🦅', title: 'Águila', text: 'Has logrado el 100% de tu objetivo de ahorro.' },
  { emoji: '🔥', title: 'En Llamas', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '⚡', title: 'Rayo', text: 'Has completado el 100% de tu objetivo de ahorro.' },
  { emoji: '🌋', title: 'Volcán', text: 'Has llegado al 100% de tu meta de ahorro.' },
  { emoji: '🌠', title: 'Estrella Fugaz', text: 'Has alcanzado el 100% de tu objetivo de ahorro.' },
  { emoji: '🎇', title: 'Fuegos Artificiales', text: 'Has logrado el 100% de tu meta de ahorro.' },
  { emoji: '🏹', title: 'Arco y Flecha', text: 'Has completado el 100% de tu objetivo de ahorro.' },
  { emoji: '⚽', title: 'Gol', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '🎾', title: 'Ace', text: 'Has logrado el 100% de tu objetivo de ahorro.' },
  { emoji: '🏸', title: 'Volante', text: 'Has completado el 100% de tu meta de ahorro.' },
  { emoji: '🏓', title: 'Ping Pong', text: 'Has alcanzado el 100% de tu objetivo de ahorro.' },
  { emoji: '🏊', title: 'Nadando', text: 'Has logrado el 100% de tu meta de ahorro.' },
  { emoji: '🚴', title: 'Ciclista', text: 'Has completado el 100% de tu objetivo de ahorro.' },
  { emoji: '🧗', title: 'Escalador', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '🏋️', title: 'Pesas', text: 'Has logrado el 100% de tu objetivo de ahorro.' },
  { emoji: '🧘', title: 'Meditación', text: 'Has completado el 100% de tu meta de ahorro.' },
  { emoji: '🎶', title: 'Música', text: 'Has alcanzado el 100% de tu objetivo de ahorro.' },
  { emoji: '🎵', title: 'Nota Musical', text: 'Has logrado el 100% de tu meta de ahorro.' },
  { emoji: '🎤', title: 'Micrófono', text: 'Has completado el 100% de tu objetivo de ahorro.' },
  { emoji: '🎧', title: 'Audífonos', text: 'Has alcanzado el 100% de tu meta de ahorro.' },
  { emoji: '📸', title: 'Fotografía', text: 'Has logrado el 100% de tu objetivo de ahorro.' },
  { emoji: '🎬', title: 'Cine', text: 'Has completado el 100% de tu meta de ahorro.' },
  { emoji: '📺', title: 'TV', text: 'Has alcanzado el 100% de tu objetivo de ahorro.' },
  { emoji: '💡', title: 'Luz', text: 'Has logrado el 100% de tu meta de ahorro.' },
  { emoji: '🔦', title: 'Linterna', text: 'Has completado el 100% de tu objetivo de ahorro.' }
];

let progressIndex = 0;
let completeIndex = 0;

const getNextMessage = function(array, indexVar) {
  const msg = array[indexVar % array.length];
  indexVar = (indexVar + 1) % array.length;
  if (array === progressMessages) progressIndex = indexVar;
  else if (array === completeMessages) completeIndex = indexVar;
  return msg;
};

const getCategoryProgressTotal = function(cat) {
  if (!cat) return 0;
  if (cat.type === 'save_future' || cat.type === 'save_booking') {
    return transactions.filter(function(t) { return t.catId === cat.id; }).reduce(function(sum, t) { return sum + t.amount; }, 0);
  }
  return transactions.filter(function(t) { return t.month === currentMonth && t.catId === cat.id; }).reduce(function(sum, t) { return sum + t.amount; }, 0);
};

