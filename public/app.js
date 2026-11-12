// ===== CONTROLADOR DEL ONBOARDING (MonAi) =====
// El login real (email/password, Google, Apple) vive mas abajo, en la zona
// de Firebase Auth. Este bloque solo controla la navegacion entre pantallas
// del onboarding (welcome, q1, q2, q3, loading) y las respuestas de las
// preguntas de personalizacion.
(function() {
  var monaiAnswers = { q1: null, q2: [], q3: [] };

  function monaiShowScreen(name) {
    var onboarding = document.getElementById('monaiOnboarding');
    if (!onboarding) return;
    onboarding.querySelectorAll('.monai-screen').forEach(function(s) { s.classList.remove('monai-active'); });
    var target = onboarding.querySelector('.monai-screen[data-screen="' + name + '"]');
    if (target) target.classList.add('monai-active');
  }

  function monaiSetAuthTab(tab) {
    var onboarding = document.getElementById('monaiOnboarding');
    if (!onboarding) return;
    onboarding.querySelectorAll('.monai-tab').forEach(function(t) {
      t.classList.toggle('monai-active-tab', t.getAttribute('data-tab') === tab);
    });
    var createPane = onboarding.querySelector('[data-authpane="create"]');
    var loginPane = onboarding.querySelector('[data-authpane="login"]');
    if (createPane) createPane.style.display = (tab === 'create') ? 'block' : 'none';
    if (loginPane) loginPane.style.display = (tab === 'login') ? 'block' : 'none';
  }

  function monaiUpdateOptionState(container) {
    var question = container.getAttribute('data-question');
    var mode = container.getAttribute('data-mode');
    var screen = container.closest('.monai-screen');
    if (!screen) return;
    var nextBtn = screen.querySelector('.monai-btn-primary[data-action]');
    if (!nextBtn) return;
    var hasSelection = (mode === 'multi') ? monaiAnswers[question].length > 0 : !!monaiAnswers[question];
    nextBtn.disabled = !hasSelection;
  }

  function monaiHandleOptionClick(el) {
    var container = el.closest('.monai-options');
    if (!container) return;
    var question = container.getAttribute('data-question');
    var mode = container.getAttribute('data-mode');
    var value = el.getAttribute('data-value');
    if (mode === 'single') {
      container.querySelectorAll('.monai-opt').forEach(function(o) { o.classList.remove('monai-selected'); });
      el.classList.add('monai-selected');
      monaiAnswers[question] = value;
    } else {
      var max = parseInt(container.getAttribute('data-max') || '99', 10);
      var idx = monaiAnswers[question].indexOf(value);
      if (idx >= 0) {
        monaiAnswers[question].splice(idx, 1);
        el.classList.remove('monai-selected');
      } else {
        if (monaiAnswers[question].length >= max) return;
        monaiAnswers[question].push(value);
        el.classList.add('monai-selected');
      }
    }
    monaiUpdateOptionState(container);
  }

  function monaiHandleAction(action, el) {
    if (el && el.disabled) return;
    switch (action) {
      case 'go-step1':
        monaiShowScreen('q1');
        break;
      case 'go-welcome':
        monaiShowScreen('welcome');
        break;
      case 'go-q1':
        monaiShowScreen('q1');
        break;
      case 'go-q2':
        monaiShowScreen('q2');
        break;
      case 'go-q3':
        monaiShowScreen('q3');
        break;
      case 'go-loading':
        monaiShowScreen('loading');
        setTimeout(function() {
          monaiShowScreen('auth');
          monaiSetAuthTab('create');
        }, 1600);
        break;
      case 'go-login':
        monaiShowScreen('auth');
        monaiSetAuthTab('login');
        break;
    }
  }

  var monaiOnboardingEl = document.getElementById('monaiOnboarding');
  if (monaiOnboardingEl) {
    monaiOnboardingEl.addEventListener('click', function(e) {
      var actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        monaiHandleAction(actionEl.getAttribute('data-action'), actionEl);
        return;
      }
      var optEl = e.target.closest('.monai-opt');
      if (optEl) {
        monaiHandleOptionClick(optEl);
        return;
      }
      var tabEl = e.target.closest('.monai-tab');
      if (tabEl) {
        monaiSetAuthTab(tabEl.getAttribute('data-tab'));
        return;
      }
    });
  }

  // ===== API publica minima (compatibilidad con el resto de la app) =====
  // Ya no hay perfiles locales ni PIN: el login real ahora es Firebase Auth
  // (email/password, Google o Apple). Este objeto se conserva vacio por si
  // algo mas abajo todavia lo referencia.
  window.MonAiAuth = {
    getActiveProfile: function() { return null; },
    logout: function() {}
  };
})();


// ===== DICCIONARIO DE TRADUCCIONES (Fase 5) =====
const translations = {
  en: {
    welcome_title: 'Welcome to <span class="monai-accent">My Finances</span>',
    welcome_sub: 'Your finances, clear and under control',
    start_btn: '→ Start',
    have_account: 'Already have an account? <span class="monai-link">Log in</span>',
    login_link: 'Log in',
    terms: 'Your data is stored in the cloud.',
    step_1: '1/3',
    step_2: '2/3',
    step_3: '3/3',
    q1_title: 'What would you like to <span class="monai-accent">achieve</span> with your finances?',
    q1_sub: 'Choose one',
    q1_opt1: 'Save more each month',
    q1_opt2: 'Know where my money goes',
    q1_opt3: 'Reach a specific goal',
    q1_opt4: 'Stop living with stress',
    q2_title: 'What <span class="monai-accent">eats</span> your budget?',
    q2_sub: 'Choose as many as you want (minimum 1)',
    q2_opt1: 'Fast Food',
    q2_opt2: 'Restaurants',
    q2_opt3: 'Coffee',
    q2_opt4: 'Delivery',
    q2_opt5: 'Fun',
    q2_opt6: 'Nightlife',
    q2_opt7: 'Transport',
    q2_opt8: 'Shopping',
    q2_opt9: 'Clothing',
    q2_opt10: 'Subscriptions',
    q2_opt11: 'Technology',
    q2_opt12: 'Pets',
    q3_title: 'How do you prefer to <span class="monai-accent">record</span> your expenses?',
    q3_sub: 'Choose one',
    q3_opt1: 'Typing it quickly',
    q3_opt2: 'Speaking it out loud',
    q3_opt3: 'Automatic when paying',
    q3_opt4: 'The easiest way',
    next_btn: '→ Next',
    create_plan_btn: '→ Create my plan',
    creating_profile: 'Creating <span class="monai-accent">your profile…</span>',
    analyzing: 'Analyzing your <span class="monai-accent">answers</span>',
    fact: 'Just recording your expenses already changes your spending habits, without doing anything else.',
    auth_title: 'Save your <span class="monai-accent">progress</span>',
    auth_sub: 'Create your account or log in to an existing one',
    tab_create: 'Create account',
    tab_login: 'Log in',
    name_label: 'Name',
    name_placeholder: 'What\'s your name?',
    email_label: 'Email',
    email_placeholder: 'you@email.com',
    password_label: 'Password',
    password_placeholder: 'At least 8 characters',
    password_placeholder_login: '••••••••',
    create_account_btn: 'Create my account',
    login_btn: 'Log in',
    or_divider: 'or continue with',
    continue_google: 'Continue with Google',
    continue_apple: 'Continue with Apple',
    terms_cloud: 'By continuing you agree to store your information in the cloud.',
    gopro_settings_item: '⭐ Go Pro',
    gopro_title: 'Go Pro',
    gopro_subtitle: 'Support development and unlock premium features',
    gopro_best_value: 'BEST VALUE',
    gopro_yearly_title: '12 months',
    gopro_yearly_sub: 'equals $6,667/month',
    gopro_yearly_save: 'You save 17%',
    gopro_monthly_title: 'Monthly',
    gopro_monthly_sub: 'billed monthly',
    gopro_cop: 'COP',
    gopro_continue: 'Continue',
    gopro_cancel_anytime: 'Cancel anytime',
    gopro_privacy: 'Privacy',
    gopro_restore: 'Restore purchases',
    gopro_contact: 'Contact',
    save: 'Save',
    expense: 'Expense',
    income: 'Income',
    savings: 'Savings',
    incomes: 'Incomes',
    expenses: 'Expenses',
    category: 'Category',
    account: 'Account',
    cash: 'Cash',
    card: 'Card',
    cards: 'Cards',
    amount: 'Amount',
    description_placeholder: 'Describe',
    description: 'Description',
    today: 'Today',
    save_btn: 'Save',
    cancel: 'Cancel',
    accept: 'Accept',
    edit: 'Edit',
    delete: 'Delete',
    share: 'Share',
    name: 'Name',
    save_changes: 'Save changes',
    settings_title: '⚙️ Settings',
    account_info: '👤 Account Information',
    edit_categories: '✏️ Edit Categories',
    edit_cards: '💳 Edit Cards',
    budgets: '💰 Budgets',
    future_savings: '🔮 Future Savings',
    take_from_balance: 'Take from balance',
    reco_title: 'Recommendation',
    reco_buy: 'Buy',
    reco_sell: 'Sell',
    reco_days: 'days',
    reco_view_history: 'View history',
    reco_history_title: 'Recommendation history',
    reco_settings_item: '📊 Recommendation',
    reco_disclaimer: 'This analysis is based on historical data. It does not guarantee future results. It does not constitute financial advice.',
    recurring_charges: '🔁 Recurring Charges',
    export_data: '📤 Export my data',
    import_data: '📥 Import my data',
    language: '🌐 Language',
    primary_currency: '💵 Primary Currency',
    secondary_currency: 'Secondary Currency',
    logout: '🚪 Logout',
    budgets_desc: 'Set monthly limits for your expense, income and savings categories.',
    notification_alert: '🔔 Notification Alert',
    notification_hint: 'You\'ll be notified when a category exceeds this percentage of its budget',
    save_all_budgets: '💾 Save All Budgets',
    search_categories: 'Search categories...',
    future_savings_desc: 'Manage your savings goals and targets (includes both Future Savings and Booking).',
    future_notification_hint: 'You\'ll be notified when a goal reaches this percentage',
    save_targets: '💾 Save All Targets',
    new_savings_category: '＋ New savings category',
    completed_goals: '📦 Completed Goals (deleted)',
    new_recurring: '＋ New Recurring Charge',
    recurring_desc: 'Schedule automatic charges or movements like Spotify, your salary or a fixed savings. They will be reflected in your Incomes, Expenses or Savings on the chosen day.',
    movement_type: 'Movement Type',
    payment_method: 'Payment Method',
    scheduling: 'Scheduling',
    frequency: 'Frequency',
    every: 'Every',
    week: 'Week',
    '15days': '15 Days',
    month: 'Month',
    year: 'Year',
    custom: 'Custom',
    days: 'Days',
    weeks: 'Weeks',
    months: 'Months',
    years: 'Years',
    reminders: 'Reminders',
    no_reminders: '🔔 No reminders',
    reminder_hint: 'Tap up to 3 days before the charge to activate reminders.',
    save_recurring: '✅ Save Charge',
    cancel_subscription: '🗑️ Cancel subscription',
    new_category: '＋ New Category',
    choose_emoji: 'Choose Emoji',
    choose_emoji_title: 'Choose an emoji',
    target_amount_optional: 'Target Amount (optional):',
    create_category: '✅ Create Category',
    category_name_placeholder: 'Category name...',
    edit_savings_category: '✏️ Edit savings category',
    my_boards: 'My Boards',
    new_board: '＋ New Board',
    edit_board: '✏️ Edit name',
    share_board: '🔗 Share board',
    delete_board: '🗑️ Delete board',
    my_account: 'My Account',
    are_you_sure: 'Are you sure?',
    action_irreversible: 'This action cannot be undone.',
    yes_continue: 'Yes, continue',
    month_changed: 'The month has changed',
    rollover_desc: 'Your previous month balance was negative. Do you want to start with your current balance or from zero?',
    start_current: 'Start with my current balance',
    start_zero: 'Start from zero',
    completed_options: '📦 Completed Goal Options',
    select_action: 'Select an action',
    delete_permanently: '🗑️ Delete permanently',
    restore_zero: '🔄 Redo from zero',
    restore_full: '🔄 Redo to 100%',
    search_title: '🔍 Search',
    search_placeholder: 'Search by category, title, amount or #tag...',
    balance_desc: 'COP 0 spent',
    save_label: 'Save',
    booking: '💰 Booking',
    details_by_cards: 'Details by cards ▾',
    custom_alert: '✏️ Custom Alert',
    custom_alert_desc: 'Set custom notification percentage for this category',
    drag_to_set: 'Drag to set custom alert percentage',
    choose_color: 'Choose a color (will darken from 80% to 100%):',
    save_custom_alert: '💾 Save Custom Alert',
    select_language: '🌐 Select Language',
    select_currency: '💵 Select Currency',
    search_language: 'Search language...',
    messages_title: '📨 Messages',
    no_messages: 'No pending messages',
    new_card: '＋ New Card',
    create_card: '✅ Create Card',
    card_name_placeholder: 'Card name...',
    alert_exported: 'Export successful! Keep that file safe. When you open a new version of the app, use "Import my data" to bring everything back.',
    alert_invalid_file: '⚠️ Invalid file',
    alert_invalid_file_desc: 'We couldn\'t read that backup file. Make sure you choose the JSON you exported from this same app.',
    alert_name_required: 'Please enter a name.',
    alert_amount_required: 'Please enter the amount.',
    alert_category_required: 'Please choose a category.',
    alert_date_required: 'Tap the "📅 Date" button and pick a day in the calendar.',
    alert_max_reminders: 'Maximum 3 reminders',
    alert_max_reminders_desc: 'You already chose 3 reminder days. Remove one if you want to change it.',
    alert_invalid_amount: 'Invalid amount',
    alert_invalid_amount_desc: 'Please enter a valid amount.',
    alert_amount_needed: 'Amount needed',
    alert_amount_needed_desc: 'You need to enter an amount/limit first before setting the alert.',
    alert_save_error: 'Could not save',
    alert_save_error_desc: 'Firebase responded: "{{error}}". If it says "permission-denied", check your Firestore rules in Firebase Console.',
    alert_sync_lost: 'Sync lost',
    alert_sync_lost_desc: 'Firebase responded: "{{error}}".',
    alert_import_success: 'Data imported. The app will now reload.',
    alert_share_sent: 'Invitation sent',
    alert_share_sent_desc: 'When "{{email}}" logs in with Google using that email, they will automatically have access to this board.',
    alert_rollover_previous: 'Previous month balance',
    alert_rollover_previous_desc: 'Your previous month closed with a ${{amount}} {{sign}} balance. You already made a decision about it.',
    month_jan: 'Jan',
    month_feb: 'Feb',
    month_mar: 'Mar',
    month_apr: 'Apr',
    month_may: 'May',
    month_jun: 'Jun',
    month_jul: 'Jul',
    month_aug: 'Aug',
    month_sep: 'Sep',
    month_oct: 'Oct',
    month_nov: 'Nov',
    month_dec: 'Dec',
    month_full_jan: 'January',
    month_full_feb: 'February',
    month_full_mar: 'March',
    month_full_apr: 'April',
    month_full_may: 'May',
    month_full_jun: 'June',
    month_full_jul: 'July',
    month_full_aug: 'August',
    month_full_sep: 'September',
    month_full_oct: 'October',
    month_full_nov: 'November',
    month_full_dec: 'December',
    day_sun: 'Su',
    day_mon: 'Mo',
    day_tue: 'Tu',
    day_wed: 'We',
    day_thu: 'Th',
    day_fri: 'Fr',
    day_sat: 'Sa',
    reminder_today: 'Today is "{{name}}" ({{amount}})! Don\'t forget to add it to {{type}}.',
    reminder_days: '{{days}} day(s) left for "{{name}}" ({{amount}}){{time}}. We\'re reminding you so it doesn\'t catch you by surprise 💙',
    at_time: ' at {{time}}',
    type_income: 'Incomes',
    type_expense: 'Expenses',
    type_save: 'Savings',
    future_savings_short: 'Future Savings',
    booking_short: 'Booking',
    create_board: 'Create board',
    enter_name: 'Enter name',
    edit_name: 'Edit name',
    confirm_delete: 'Delete',
    confirm: 'Confirm',
    tag_placeholder: '#tag and Enter (e.g. business)',
    warning_badge: '⚠️ Warning',
    positive_badge: '🎉 Goal reached!',
    custom_slider_title: 'Custom Alert - ',
    filter_clear: 'Clear filter',
    edit_category_name: "Edit category name",
  },
  es: {
    welcome_title: 'Bienvenido a <span class="monai-accent">Mis Finanzas</span>',
    welcome_sub: 'Tus finanzas, claras y bajo control',
    start_btn: '→ Comenzar',
    have_account: '¿Ya tienes una cuenta? <span class="monai-link">Iniciar sesión</span>',
    login_link: 'Iniciar sesión',
    terms: 'Tus datos se guardan en la nube.',
    step_1: '1/3',
    step_2: '2/3',
    step_3: '3/3',
    q1_title: '¿Qué te gustaría <span class="monai-accent">lograr</span> con tus finanzas?',
    q1_sub: 'Elige una',
    q1_opt1: 'Ahorrar más cada mes',
    q1_opt2: 'Saber en qué se me va',
    q1_opt3: 'Cumplir una meta puntual',
    q1_opt4: 'Dejar de vivir con estrés',
    q2_title: '¿Qué se <span class="monai-accent">come</span> tu presupuesto?',
    q2_sub: 'Elige las que quieras (mínimo 1)',
    q2_opt1: 'Fast Food',
    q2_opt2: 'Restaurantes',
    q2_opt3: 'Café',
    q2_opt4: 'Delivery',
    q2_opt5: 'Diversión',
    q2_opt6: 'Salidas Nocturnas',
    q2_opt7: 'Transporte',
    q2_opt8: 'Shopping',
    q2_opt9: 'Ropa',
    q2_opt10: 'Suscripciones',
    q2_opt11: 'Tecnología',
    q2_opt12: 'Mascotas',
    q3_title: '¿Cómo prefieres <span class="monai-accent">registrar</span> tus gastos?',
    q3_sub: 'Elige una',
    q3_opt1: 'Escribiéndolo rápido',
    q3_opt2: 'Diciéndolo en voz alta',
    q3_opt3: 'Automático al pagar',
    q3_opt4: 'Lo más fácil del momento',
    next_btn: '→ Siguiente',
    create_plan_btn: '→ Crear mi plan',
    creating_profile: 'Creando <span class="monai-accent">tu perfil…</span>',
    analyzing: 'Analizando tus <span class="monai-accent">respuestas</span>',
    fact: 'Solo el hecho de registrar tus gastos ya cambia tus hábitos de consumo, sin hacer nada más.',
    auth_title: 'Guarda tu <span class="monai-accent">progreso</span>',
    auth_sub: 'Crea tu cuenta o entra a la que ya tienes',
    tab_create: 'Crear cuenta',
    tab_login: 'Iniciar sesión',
    name_label: 'Nombre',
    name_placeholder: '¿Cómo te llamas?',
    email_label: 'Correo',
    email_placeholder: 'tu@correo.com',
    password_label: 'Contraseña',
    password_placeholder: 'Mínimo 8 caracteres',
    password_placeholder_login: '••••••••',
    create_account_btn: 'Crear mi cuenta',
    login_btn: 'Iniciar sesión',
    or_divider: 'o continúa con',
    continue_google: 'Continuar con Google',
    continue_apple: 'Continuar con Apple',
    terms_cloud: 'Al continuar aceptas guardar tu información en la nube.',
    gopro_settings_item: '⭐ Go Pro',
    gopro_title: 'Go Pro',
    gopro_subtitle: 'Apoya el desarrollo y desbloquea funciones premium',
    gopro_best_value: 'MEJOR VALOR',
    gopro_yearly_title: '12 meses',
    gopro_yearly_sub: 'equivale a $6.667/mes',
    gopro_yearly_save: 'Ahorras 17%',
    gopro_monthly_title: 'Mensual',
    gopro_monthly_sub: 'facturación mensual',
    gopro_cop: 'COP',
    gopro_continue: 'Continuar',
    gopro_cancel_anytime: 'Cancelas cuando quieras',
    gopro_privacy: 'Privacidad',
    gopro_restore: 'Restaurar compras',
    gopro_contact: 'Contacto',
    save: 'Ahorro',
    expense: 'Egreso',
    income: 'Ingreso',
    savings: 'Ahorros',
    incomes: 'Ingresos',
    expenses: 'Egresos',
    category: 'Categoría',
    account: 'Cuenta',
    cash: 'Efectivo',
    card: 'Tarjeta',
    cards: 'Tarjetas',
    amount: 'Monto',
    description_placeholder: 'Descripción',
    description: 'Descripción',
    today: 'Hoy',
    save_btn: 'Guardar',
    cancel: 'Cancelar',
    accept: 'Aceptar',
    edit: 'Editar',
    delete: 'Eliminar',
    share: 'Compartir',
    name: 'Nombre',
    save_changes: 'Guardar cambios',
    settings_title: '⚙️ Configuración',
    account_info: '👤 Información de la cuenta',
    edit_categories: '✏️ Editar categorías',
    edit_cards: '💳 Editar tarjetas',
    budgets: '💰 Presupuestos',
    future_savings: '🔮 Ahorros a futuro',
    take_from_balance: 'Tomar de balance',
    reco_title: 'Recomendación',
    reco_buy: 'Comprar',
    reco_sell: 'Vender',
    reco_days: 'días',
    reco_view_history: 'Ver historial',
    reco_history_title: 'Historial de recomendaciones',
    reco_settings_item: '📊 Recomendación',
    reco_disclaimer: 'Este análisis se basa en datos históricos. No garantiza resultados futuros. No constituye asesoría financiera.',
    recurring_charges: '🔁 Cobros recurrentes',
    export_data: '📤 Exportar mis datos',
    import_data: '📥 Importar mis datos',
    language: '🌐 Idioma',
    primary_currency: '💵 Moneda principal',
    secondary_currency: 'Moneda secundaria',
    logout: '🚪 Cerrar sesión',
    budgets_desc: 'Establece límites mensuales para tus categorías de egresos, ingresos y ahorros.',
    notification_alert: '🔔 Alerta de notificación',
    notification_hint: 'Recibirás una notificación cuando una categoría supere este porcentaje de su presupuesto',
    save_all_budgets: '💾 Guardar todos los presupuestos',
    search_categories: 'Buscar categorías...',
    future_savings_desc: 'Administra tus metas de ahorro (incluye Ahorro a futuro y Booking).',
    future_notification_hint: 'Recibirás una notificación cuando la meta alcance este porcentaje',
    save_targets: '💾 Guardar todas las metas',
    new_savings_category: '＋ Nueva categoría de ahorro',
    completed_goals: '📦 Metas completadas (eliminadas)',
    new_recurring: '＋ Nuevo cobro recurrente',
    recurring_desc: 'Programa cobros o movimientos automáticos como Spotify, tu salario o un ahorro fijo. Se reflejan en tus Ingresos, Egresos o Ahorros el día que elijas.',
    movement_type: 'Tipo de movimiento',
    payment_method: 'Medio de pago',
    scheduling: 'Programación',
    frequency: 'Frecuencia',
    every: 'Cada',
    week: 'Semana',
    '15days': '15 Días',
    month: 'Mes',
    year: 'Año',
    custom: 'Personalizado',
    days: 'Días',
    weeks: 'Semanas',
    months: 'Meses',
    years: 'Años',
    reminders: 'Avisos anticipados',
    no_reminders: '🔔 Sin recordatorios',
    reminder_hint: 'Toca hasta 3 días antes del cobro para activar avisos.',
    save_recurring: '✅ Guardar cobro',
    cancel_subscription: '🗑️ Cancelar suscripción',
    new_category: '＋ Nueva categoría',
    choose_emoji: 'Elegir emoji',
    choose_emoji_title: 'Elige un emoji',
    target_amount_optional: 'Monto objetivo (opcional):',
    create_category: '✅ Crear categoría',
    category_name_placeholder: 'Nombre de la categoría...',
    edit_savings_category: '✏️ Editar categoría de ahorro',
    my_boards: 'Mis tableros',
    new_board: '＋ Nuevo tablero',
    edit_board: '✏️ Editar nombre',
    share_board: '🔗 Compartir tablero',
    delete_board: '🗑️ Eliminar tablero',
    my_account: 'Mi cuenta',
    are_you_sure: '¿Estás seguro?',
    action_irreversible: 'Esta acción no se puede deshacer.',
    yes_continue: 'Sí, continuar',
    month_changed: 'El mes ha cambiado',
    rollover_desc: 'Tu balance del mes anterior fue negativo. ¿Quieres empezar con tu balance actual o desde cero?',
    start_current: 'Empezar con mi balance actual',
    start_zero: 'Empezar desde cero',
    completed_options: '📦 Opciones de meta completada',
    select_action: 'Selecciona una acción',
    delete_permanently: '🗑️ Borrar definitivamente',
    restore_zero: '🔄 Rehacer desde cero',
    restore_full: '🔄 Rehacer al 100%',
    search_title: '🔍 Buscar',
    search_placeholder: 'Buscar por categoría, título, monto o #etiqueta...',
    balance_desc: 'COP 0 gastados',
    save_label: 'Ahorro',
    booking: '💰 Booking',
    details_by_cards: 'Detalles por tarjetas ▾',
    custom_alert: '✏️ Alerta personalizada',
    custom_alert_desc: 'Establece un porcentaje de notificación personalizado para esta categoría',
    drag_to_set: 'Arrastra para establecer el porcentaje de alerta',
    choose_color: 'Elige un color (se oscurecerá del 80% al 100%):',
    save_custom_alert: '💾 Guardar alerta personalizada',
    select_language: '🌐 Seleccionar idioma',
    select_currency: '💵 Seleccionar moneda',
    search_language: 'Buscar idioma...',
    messages_title: '📨 Mensajes',
    no_messages: 'No hay mensajes pendientes',
    notifications_title: '🔔 Notificaciones',
    no_notifications: 'No hay notificaciones',
    new_card: '＋ Nueva tarjeta',
    create_card: '✅ Crear tarjeta',
    card_name_placeholder: 'Nombre de la tarjeta...',
    alert_exported: '¡Exportación exitosa! Guarda ese archivo. Cuando abras una nueva versión de la app, usa "Importar mis datos" para traer todo de vuelta.',
    alert_invalid_file: '⚠️ Archivo inválido',
    alert_invalid_file_desc: 'No pudimos leer ese archivo de respaldo. Asegúrate de elegir el JSON que exportaste desde esta misma app.',
    alert_name_required: 'Por favor ingresa un nombre.',
    alert_amount_required: 'Por favor ingresa el monto.',
    alert_category_required: 'Por favor elige una categoría.',
    alert_date_required: 'Toca el botón "📅 Fecha" y elige el día en el calendario.',
    alert_max_reminders: 'Máximo 3 avisos',
    alert_max_reminders_desc: 'Ya elegiste 3 días de aviso. Quita uno si quieres cambiarlo.',
    alert_invalid_amount: 'Monto inválido',
    alert_invalid_amount_desc: 'Por favor ingresa un monto válido.',
    alert_amount_needed: 'Falta el monto',
    alert_amount_needed_desc: 'Primero necesitas agregar un monto/límite antes de configurar la alerta.',
    alert_save_error: 'No se pudo guardar',
    alert_save_error_desc: 'Firebase respondió: "{{error}}". Si dice "permission-denied", revisa las reglas de Firestore en Firebase Console.',
    alert_sync_lost: 'Se perdió la sincronización',
    alert_sync_lost_desc: 'Firebase respondió: "{{error}}".',
    alert_import_success: 'Datos importados. La app se va a recargar ahora.',
    alert_share_sent: 'Invitación enviada',
    alert_share_sent_desc: 'Cuando "{{email}}" inicie sesión con Google usando ese correo, va a tener acceso a este tablero automáticamente.',
    alert_rollover_previous: 'Balance del mes anterior',
    alert_rollover_previous_desc: 'Tu mes anterior cerró con un balance ${{amount}} {{sign}}. Ya tomaste una decisión sobre este saldo.',
    month_jan: 'Ene',
    month_feb: 'Feb',
    month_mar: 'Mar',
    month_apr: 'Abr',
    month_may: 'May',
    month_jun: 'Jun',
    month_jul: 'Jul',
    month_aug: 'Ago',
    month_sep: 'Sep',
    month_oct: 'Oct',
    month_nov: 'Nov',
    month_dec: 'Dic',
    month_full_jan: 'Enero',
    month_full_feb: 'Febrero',
    month_full_mar: 'Marzo',
    month_full_apr: 'Abril',
    month_full_may: 'Mayo',
    month_full_jun: 'Junio',
    month_full_jul: 'Julio',
    month_full_aug: 'Agosto',
    month_full_sep: 'Septiembre',
    month_full_oct: 'Octubre',
    month_full_nov: 'Noviembre',
    month_full_dec: 'Diciembre',
    day_sun: 'D',
    day_mon: 'L',
    day_tue: 'M',
    day_wed: 'M',
    day_thu: 'J',
    day_fri: 'V',
    day_sat: 'S',
    reminder_today: '¡Hoy toca "{{name}}" ({{amount}})! No lo olvides agregar en {{type}}.',
    reminder_days: 'Faltan {{days}} día(s) para "{{name}}" ({{amount}}){{time}}. Te lo recordamos con cariño para que no te tome por sorpresa 💙',
    at_time: ' a las {{time}}',
    type_income: 'Ingresos',
    type_expense: 'Egresos',
    type_save: 'Ahorros',
    future_savings_short: 'Ahorro a futuro',
    booking_short: 'Booking',
    create_board: 'Crear tablero',
    enter_name: 'Escribe un nombre',
    edit_name: 'Editar nombre',
    confirm_delete: 'Eliminar',
    confirm: 'Confirmar',
    tag_placeholder: '#etiqueta y Enter (ej: negocios)',
    warning_badge: '⚠️ Advertencia',
    positive_badge: '🎉 ¡Meta alcanzada!',
    custom_slider_title: '✏️ Alerta personalizada - ',
    filter_clear: 'Limpiar filtro',
    edit_category_name: "Editar nombre de categoría",
  }
};

// ===== FUNCIÓN PARA TRADUCIR =====
function t(key, replacements) {
  const lang = language || 'en';
  let text = translations[lang] && translations[lang][key] ? translations[lang][key] : key;
  if (replacements) {
    Object.keys(replacements).forEach(function(k) {
      text = text.replace(new RegExp('{{' + k + '}}', 'g'), replacements[k]);
    });
  }
  return text;
}

// ===== APLICAR TRADUCCIÓN A TODOS LOS ELEMENTOS CON data-i18n =====
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    const key = el.getAttribute('data-i18n');
    let text = t(key);
    if (text.includes('<') && text.includes('>')) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  const langDisplay = document.getElementById('settingsLanguage');
  if (langDisplay) {
    langDisplay.textContent = language === 'en' ? 'English' : 'Español';
  }
  if (document.getElementById('languageModal').classList.contains('open')) {
    renderLanguageList();
  }
}

// ===== SELECTOR DE IDIOMAS =====
const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

function openLanguageSelector() {
  renderLanguageList();
  document.getElementById('languageModal').classList.add('open');
}

function closeLanguageSelector() {
  document.getElementById('languageModal').classList.remove('open');
}

function renderLanguageList() {
  const list = document.getElementById('languageList');
  const query = normalizeSearchText(document.getElementById('langSearchInput') ? document.getElementById('langSearchInput').value : '');
  list.innerHTML = '';
  const filtered = availableLanguages.filter(function(lang) {
    return normalizeSearchText(lang.name).includes(query) || lang.code.includes(query);
  });
  filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });
  filtered.forEach(function(lang) {
    const item = document.createElement('div');
    item.className = 'language-item' + (lang.code === language ? ' selected' : '');
    item.innerHTML = '<span>' + lang.flag + ' ' + lang.name + '</span><span>' + (lang.code === language ? '✓' : '') + '</span>';
    item.onclick = function() {
      setLanguage(lang.code);
      closeLanguageSelector();
    };
    list.appendChild(item);
  });
}

function filterLanguages() {
  renderLanguageList();
}

function setLanguage(lang) {
  language = lang;
  localStorage.setItem('language_v29', language);
  applyTranslations();
  scheduleGuardarEnFirebase();
}

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

function updateCurrencyRates(force) {
  var lastUpdate = parseInt(localStorage.getItem('currencyRatesUpdatedAt_v1') || '0', 10);
  if (!force && (Date.now() - lastUpdate) < 12 * 60 * 60 * 1000) return Promise.resolve(currencyRates);
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


// ===== SELECTOR DE SALDO: Balance general / Efectivo / cada tarjeta =====
let balanceScope = null;
let balanceScopeOpen = false;

// Calcula el saldo de TODAS las cuentas (Efectivo + tarjetas) del mes actual
// de una sola vez, garantizando por construccion que:
//   Efectivo + suma(tarjetas) === Balance general del mes
// 1) Cada movimiento se cuenta en UNA sola cuenta. Si su accStr no coincide
//    con Efectivo ni con ninguna tarjeta activa (cargos del sistema, tarjetas
//    ya borradas, datos viejos) se le asigna a Efectivo, para que nada quede
//    "huerfano" fuera de la suma.
// 2) Ninguna tarjeta se muestra en negativo: si una tarjeta gasto mas de lo
//    que recibio ese mes, su deficit se le resta a Efectivo (el dinero salio
//    de algun lado) y la tarjeta se ve en $0.
function calcularSaldosDeCuentas() {
  var nombresTarjetas = (myCards || []).filter(function(c) { return c !== 'Cash' && c !== 'Efectivo'; });
  var saldos = { 'Efectivo': 0 };
  nombresTarjetas.forEach(function(n) { saldos[n] = 0; });

  transactions.forEach(function(t) {
    if (t.month !== currentMonth) return;
    var esAhorroQueResta = (t.type === 'save' && t.takeFromBalance);
    if (t.type !== 'income' && t.type !== 'expense' && !esAhorroQueResta) return;
    var esCash = (t.accStr === 'Cash' || t.accStr === 'Efectivo');
    var cuenta = esCash ? 'Efectivo' : (nombresTarjetas.indexOf(t.accStr) !== -1 ? t.accStr : 'Efectivo');
    if (t.type === 'income') saldos[cuenta] += t.amount;
    else saldos[cuenta] -= t.amount; // expense, o ahorro que se tomo del balance
  });

  nombresTarjetas.forEach(function(n) {
    if (saldos[n] < 0) { saldos['Efectivo'] += saldos[n]; saldos[n] = 0; }
  });

  // Si despues de eso Efectivo sigue en negativo (alguna tarjeta se quedo con
  // mas dinero del que "le toca" frente al total real del mes), se recorta esa
  // tarjeta positiva lo necesario para tapar el hueco, en vez de mostrar
  // Efectivo en negativo. Asi ninguna cuenta se ve negativa Y la suma de
  // Efectivo + tarjetas sigue siendo EXACTAMENTE igual al Balance general.
  if (saldos['Efectivo'] < 0) {
    var faltante = -saldos['Efectivo'];
    var positivas = nombresTarjetas.filter(function(n) { return saldos[n] > 0; }).sort(function(x, y) { return saldos[y] - saldos[x]; });
    for (var i = 0; i < positivas.length && faltante > 0; i++) {
      var n = positivas[i];
      var recorte = Math.min(saldos[n], faltante);
      saldos[n] -= recorte;
      saldos['Efectivo'] += recorte;
      faltante -= recorte;
    }
    // Si aun asi no alcanzo a cubrirse (ya no quedan tarjetas con saldo
    // positivo que recortar), es porque de verdad hubo mas gastos que
    // ingresos en todo el mes: ahi si se deja a Efectivo en negativo, para
    // que coincida con el Balance general (que tambien se vera en rojo).
  }

  return saldos;
}

function saldoActualDeCuenta(nombre) {
  return calcularSaldosDeCuentas()[nombre] || 0;
}

window.renderBalanceScope = function() {
  var lbl = document.getElementById('balanceScopeLabel');
  if (!lbl) return;
  var es = language === 'es';
  lbl.innerText = es ? 'Explorar' : 'Explore';
  document.getElementById('balanceScopeRow').style.display = balanceScope ? 'none' : 'flex';
  document.getElementById('scopeActiveLabel').style.display = balanceScope ? 'flex' : 'none';
  if (balanceScope) {
    var col = balanceScope === 'Efectivo' ? CASH_ACCENT_COLOR : (cardColors[balanceScope] || '#3a3a3c');
    var nameEl = document.getElementById('scopeActiveName');
    nameEl.innerText = (balanceScope === 'Efectivo' ? '💵 ' + (es ? 'Efectivo' : 'Cash') : '💳 ' + balanceScope);
    nameEl.style.color = col;
  }
  document.getElementById('balanceScopeArrow').classList.toggle('open', balanceScopeOpen);
  var opts = document.getElementById('balanceScopeOptions');
  opts.classList.toggle('open', balanceScopeOpen);
  opts.innerHTML = '';
  if (!balanceScopeOpen) return;
  var saldosCuentas = calcularSaldosDeCuentas();
  var nombresTarjetas = (myCards || []).filter(function(c) { return c !== 'Cash' && c !== 'Efectivo'; });
  nombresTarjetas.sort(function(x, y) { return saldosCuentas[y] - saldosCuentas[x]; });
  var nombres = ['Efectivo'].concat(nombresTarjetas);
  nombres.forEach(function(n) {
    var chip = document.createElement('div');
    chip.className = 'scope-chip';
    var col = n === 'Efectivo' ? CASH_ACCENT_COLOR : (cardColors[n] || '#dcdfe4');
    chip.style.borderLeftColor = col;
    var b = document.createElement('b');
    b.style.color = col;
    b.innerText = (n === 'Efectivo' ? '💵 ' + (es ? 'Efectivo' : 'Cash') : '💳 ' + n);
    var sp = document.createElement('span');
    var _saldoChip = saldosCuentas[n] || 0;
    sp.innerText = (_saldoChip < 0 ? '-$' + formatMoney(Math.abs(_saldoChip)) : '$' + formatMoney(_saldoChip));
    chip.appendChild(b); chip.appendChild(sp);
    chip.onclick = function(e) { e.stopPropagation(); balanceScope = n; balanceScopeOpen = false; typeFilter = 'income'; renderApp(); };
    opts.appendChild(chip);
  });
};
window.toggleBalanceScope = function(e) {
  if (e) e.stopPropagation();
  if (balanceScope) { balanceScope = null; balanceScopeOpen = false; }
  else balanceScopeOpen = !balanceScopeOpen;
  renderApp();
};
window.clearBalanceScope = function(e) {
  if (e) e.stopPropagation();
  balanceScope = null; balanceScopeOpen = false;
  typeFilter = 'expense';
  renderApp();
};
document.addEventListener('click', function(e) {
  if (!balanceScope && !balanceScopeOpen) return;
  if (e.target.closest('#balanceScopeRow, #balanceScopeOptions, #mainBalanceClick, #scopeActiveLabel, .pills-row')) return;
  balanceScope = null; balanceScopeOpen = false;
  typeFilter = 'expense';
  renderApp();
});

const renderApp = function() {
  saveAppStateToStorage();
  monthsList.forEach(function(m) {
    var mInc = transactions.filter(function(t) { return t.month === m && t.type === 'income'; }).reduce(function(s,t) { return s + t.amount; }, 0);
    var mExp = transactions.filter(function(t) { return t.month === m && t.type === 'expense'; }).reduce(function(s,t) { return s + t.amount; }, 0);
    var net = mInc - mExp;
    var subEl = document.getElementById('m_' + m.substring(0,3));
    if(subEl) {
      var subBalEl = subEl.querySelector('.month-balance-sub');
      if(subBalEl) subBalEl.innerText = '$' + formatMoney(net);
    }
  });

  var allTx = transactions.filter(function(t) { return t.month === currentMonth; });
  allTx.sort(function(a, b) { return b.id - a.id; });
  var filtered = allTx;
  
  var totalExp = 0; var totalInc = 0; var totalSav = 0; var totalSavTomado = 0;
  allTx.forEach(function(t) {
    if(t.type === 'expense') totalExp += t.amount;
    if(t.type === 'income') totalInc += t.amount;
    if(t.type === 'save') { totalSav += t.amount; if (t.takeFromBalance) totalSavTomado += t.amount; }
  });

  var netBalance = totalInc - totalExp - totalSavTomado;
  var signCircle = document.getElementById('mainSignCircle');
  
  if (netBalance >= 0) {
    signCircle.innerText = '+';
    signCircle.className = 'status-badge-circle green';
  } else {
    signCircle.innerText = '-';
    signCircle.className = 'status-badge-circle red';
    netBalance = Math.abs(netBalance);
  }

  document.getElementById('balanceTopDesc').innerText = 'COP ' + formatMoney(totalExp) + ' spent';
  document.getElementById('mainBalanceVal').innerText = formatMoney(netBalance); 
  document.getElementById('mainCurrencyLabel').innerText = primaryCurrency;
  checkNegativeBalanceIconVisibility();
  if (balanceScope) {
    var _sc = saldoActualDeCuenta(balanceScope);
    signCircle.style.display = 'none';
    document.getElementById('mainBalanceVal').innerText = formatMoney(_sc);
    var _col = balanceScope === 'Efectivo' ? CASH_ACCENT_COLOR : (cardColors[balanceScope] || '#1a1a1a');
    document.getElementById('mainBalanceVal').style.color = _col;
    document.getElementById('balanceTopDesc').innerText = language === 'es' ? 'Saldo actual' : 'Current balance';
    var _ng = document.getElementById('negativeBalanceIcon'); if (_ng) _ng.style.display = 'none';
  } else {
    signCircle.style.display = 'inline-flex';
    document.getElementById('mainBalanceVal').style.color = '';
  }
  window.renderBalanceScope();

  document.getElementById('expVal').innerText = formatMoney(totalExp);
  document.getElementById('incVal').innerText = formatMoney(totalInc);
  
  document.getElementById('pillExpense').classList.remove('active-filter');
  document.getElementById('pillIncome').classList.remove('active-filter');
  document.getElementById('pillSave').classList.remove('active-filter');
  
  var saveMainOptions = document.getElementById('saveMainOptions');
  if(typeFilter === 'save') {
    saveMainOptions.style.display = 'flex';
  } else {
    saveMainOptions.style.display = 'none';
  }
  
  if (balanceScope) {
    filtered = filtered.filter(function(t) {
      var esCash = (t.accStr === 'Cash' || t.accStr === 'Efectivo');
      return balanceScope === 'Efectivo' ? esCash : (t.accStr === balanceScope);
    });
  }

  if (typeFilter) {
    filtered = filtered.filter(function(t) { return t.type === typeFilter; });
    if(typeFilter === 'expense') document.getElementById('pillExpense').classList.add('active-filter');
    if(typeFilter === 'income') document.getElementById('pillIncome').classList.add('active-filter');
    if(typeFilter === 'save') document.getElementById('pillSave').classList.add('active-filter');
  } else {
    typeFilter = 'expense';
    filtered = filtered.filter(function(t) { return t.type === 'expense'; });
    document.getElementById('pillExpense').classList.add('active-filter');
  }

  if (typeFilter === 'save') {
    if (mainSaveView === 'future') {
      filtered = filtered.filter(function(t) {
        var cat = allCategories.find(function(c) { return c.id === t.catId; });
        return cat && cat.type === 'save_future';
      });
    } else {
      filtered = filtered.filter(function(t) {
        var cat = allCategories.find(function(c) { return c.id === t.catId; });
        return cat && cat.type === 'save_booking';
      });
    }
  }

  if (categoryFilter) {
    filtered = filtered.filter(function(t) { return t.catId === categoryFilter; });
    var catObj = allCategories.find(function(c) { return c.id === categoryFilter; });
    document.getElementById('activeFilterPill').classList.add('active');
    document.getElementById('filterIcon').innerText = catObj ? catObj.icon : '📌';
    document.getElementById('bottomAccordionBar').classList.add('visible');
  } else {
    document.getElementById('activeFilterPill').classList.remove('active');
    document.getElementById('bottomAccordionBar').classList.remove('visible');
  }

  var txList = document.getElementById('txList');
  txList.innerHTML = '';
  filtered.forEach(function(t) {
    var cat = allCategories.find(function(c) { return c.id === t.catId; }) || {icon:'📌', name: 'Other'};
    var prefix = ''; var colorClass = 'expense';
    if(t.type === 'income') { prefix = '+'; colorClass = 'income'; }
    if(t.type === 'save') { prefix = ''; colorClass = 'save'; }
    
    var isRehecho = t.title && t.title.includes('Rehecho');
    var rehechoClass = isRehecho ? 'rehecho' : '';

    var amountBlockHtml;
    if (isRehecho) {
      amountBlockHtml = '<div class="tx-amount-pill ' + colorClass + '" style="background:transparent;">🔄 Meta reiniciada</div>';
    } else {
      amountBlockHtml = buildAmountPillHtml(t, prefix, colorClass);
    }
    
    txList.innerHTML += `
      <div class="tx-item ${rehechoClass}" onclick="openTxDetail(${t.id})">
        <div class="tx-left">
          <div class="tx-avatar"${categoryIconBadgeStyle(cat.id)}>${cat.icon}</div>
          <div>
            <div class="tx-tag" style="margin-top:0; margin-bottom:2px;">${cat.name}</div>
            <div class="tx-title">${t.title}${t.accStr && t.accStr !== 'Sistema' ? ' (' + t.accStr + ')' : ''}</div>
            ${(t.tags && t.tags.length) ? '<div style="margin-top:3px; display:flex; gap:4px; flex-wrap:wrap;">' + t.tags.map(function(tg){ return '<span style="font-size:10px; font-weight:700; color:#007aff; background:rgba(0,122,255,0.10); padding:2px 7px; border-radius:10px;">#' + tg + '</span>'; }).join('') + '</div>' : ''}
          </div>
        </div>
        ${amountBlockHtml}
      </div>
    `;
  });

  var accContainer = document.getElementById('accordionItemsContainer');
  accContainer.innerHTML = '';
  if (categoryFilter) {
    var filterCatObjForAccordion = allCategories.find(function(c) { return c.id === categoryFilter; });
    var isSavingsCatForAccordion = filterCatObjForAccordion && (filterCatObjForAccordion.type === 'save_future' || filterCatObjForAccordion.type === 'save_booking');
    document.getElementById('accordionTitleLabel').innerHTML = detailMode === 'cards' ? 'Details by cards ▾' : 'Payment history ▾';
    var accordionFiltered = isSavingsCatForAccordion
      ? transactions.filter(function(t) { return t.catId === categoryFilter; })
      : allTx.filter(function(t) { return t.catId === categoryFilter; });
    
    if(accordionFiltered.length === 0) {
      accContainer.innerHTML = '<div style="color:#8a8a8a; font-size:14px; text-align:center; padding:5px;">No transactions</div>';
    } else {
      if(detailMode === 'cards') {
         var grouped = {};
         accordionFiltered.forEach(function(t) { grouped[t.accStr] = (grouped[t.accStr] || 0) + t.amount; });
         for(var acc in grouped) {
           accContainer.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eaeaea; font-size:15px; font-weight:600;">
              <span>${acc}</span>
              <span style="color:#1a1a1a;">$${formatMoney(grouped[acc])}</span>
            </div>`;
         }
      } else {
         accordionFiltered.forEach(function(t) {
          var isRehechoDetail = t.title && t.title.includes('Rehecho');
          var amtDetailHtml;
          if (isRehechoDetail) {
            amtDetailHtml = '<span style="color:#b8860b;">🔄 Meta reiniciada</span>';
          } else if (t.origCurrency && t.origCurrency !== 'COP' && t.origCurrency !== primaryCurrency) {
            var bigUsd2 = Number(t.origAmount).toLocaleString('en-US', { maximumFractionDigits: 2 });
            var copConv2 = formatCOP(t.amount);
            amtDetailHtml = '<span style="display:flex; flex-direction:column; align-items:flex-end;">' +
                              '<span style="color:#1a1a1a;">$' + bigUsd2 + ' ' + t.origCurrency + ' ✏️</span>' +
                              '<span style="font-size:10px; color:#8a8a8a; opacity:0.55;">$' + copConv2 + ' COP</span>' +
                            '</span>';
          } else {
            amtDetailHtml = '<span style="color:#1a1a1a;">$' + formatMoney(t.amount) + ' ✏️</span>';
          }
          accContainer.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eaeaea; font-size:15px; font-weight:600; cursor:pointer;" onclick="openEditTransaction(${t.id})">
              <div style="display:flex; flex-direction:column; gap:2px;">
                <span>${t.title}${t.accStr && t.accStr !== 'Sistema' ? ' (' + t.accStr + ')' : ''}</span>
                <span style="font-size:12px; color:#8a8a8a; font-weight:500;">${t.date || 'Today'} • ${t.accStr === 'Sistema' ? 'Sistema' : t.accStr}</span>
              </div>
              ${amtDetailHtml}
            </div>`;
        });
      }
    }
  }

  var activeCats = allCategories.filter(function(c) { 
    if (deletedCategories[c.id]) return false;
    return !typeFilter || c.type === (typeFilter === 'save' ? 'save_future' : typeFilter);
  });
  
  if(typeFilter === 'save') {
    if(mainSaveView === 'booking') {
      activeCats = allCategories.filter(function(c) { return c.type === 'save_booking' && !deletedCategories[c.id]; });
    } else {
      activeCats = allCategories.filter(function(c) { return c.type === 'save_future' && !deletedCategories[c.id]; });
    }
  }

  var catTotalsMap = {};
  activeCats.forEach(function(c) {
    catTotalsMap[c.id] = getCategoryProgressTotal(c);
  });

  activeCats.sort(function(a, b) { return catTotalsMap[b.id] - catTotalsMap[a.id]; });

  var barsContainer = document.getElementById('barsContainer');
  barsContainer.innerHTML = '';
  
  const MAX_BAR_HEIGHT = 190;
  const NO_LIMIT_CAP_PCT = 80;

  var maxNoLimitAmount = 0;
  activeCats.forEach(function(c) {
    var limitC = c.budget > 0 ? c.budget : (c.target || 0);
    if (!(limitC > 0)) {
      var totC = catTotalsMap[c.id];
      if (totC > maxNoLimitAmount) maxNoLimitAmount = totC;
    }
  });

  activeCats.forEach(function(c) {
    if (deletedCategories[c.id]) return;

var catTotal = getCategoryProgressTotal(c);
var limit = (c.budget > 0) ? c.budget : (c.target || 0);
var hasBudget = limit > 0;
var pct = hasBudget ? getCategoryPct(c) : 0;
    var isCompleted = hasBudget && pct >= 100;

    var fillHeight = 0;
    if (hasBudget) {
      fillHeight = Math.min(pct, 100) / 100 * MAX_BAR_HEIGHT;
    } else if (maxNoLimitAmount > 0) {
      fillHeight = (catTotal / maxNoLimitAmount) * (NO_LIMIT_CAP_PCT / 100) * MAX_BAR_HEIGHT;
    }
    
    var threshold = customThresholds[c.id] || c.alertThreshold || globalNotificationThreshold;
    var isAlert = hasBudget && pct >= threshold && catTotal > 0 && !isCompleted;
    
    var displayValue = (c.type === 'save_future' && hasBudget) ? limit : catTotal;
    var displayStr = (c.type === 'save_future' && hasBudget) ? formatMoneyFromCategoryCurrency(displayValue, c.id) : formatMoney(displayValue);
    
    var progressHtml = '';
    if (c.type === 'save_future' && hasBudget) {
      progressHtml = '<div class="b-progress">' + pct + '%</div>';
    }

    var completedBadge = '';
    var completedClass = '';
    if (isCompleted && c.type === 'save_future') {
      var badgeText = language === 'es' ? 'Completado' : 'Complete';
      completedBadge = '<div class="b-completed-badge">✓ ' + badgeText + '</div>';
      completedClass = 'completed';
    }
    
    var clickHandler = 'applyCategoryFilter(\'' + c.id + '\')';
    
    var fillColor = '#f0f2f5';
    var borderColor = 'transparent';

    if (c.type === 'save_future') {
      if (isCompleted) {
        fillColor = 'linear-gradient(135deg, #f9d423, #f7971e)';
        borderColor = '#FFD700';
      } else if (isAlert && categoryColors[c.id]) {
        var baseColor = categoryColors[c.id];
        var darkened = darkenColor(baseColor, Math.min(pct, 100));
        fillColor = darkened;
        borderColor = darkened;
      } else if (hasBudget && pct >= 80) {
        fillColor = getSaveBarColor(pct);
        borderColor = '#FFD700';
      } else {
        fillColor = '#f0f2f5';
      }
    } else {
      if (isAlert && categoryColors[c.id]) {
        var baseColor2 = categoryColors[c.id];
        var darkened2 = darkenColor(baseColor2, Math.min(pct, 100));
        fillColor = darkened2;
        borderColor = darkened2;
      } else {
        fillColor = '#f0f2f5';
      }
    }

    barsContainer.innerHTML += `
      <div class="bar-card ${categoryFilter === c.id ? 'active' : ''} ${hasBudget ? 'has-budget' : ''} ${completedClass}" 
           onclick="${clickHandler}"
           style="${borderColor !== 'transparent' ? 'border-color: ' + borderColor + ';' : ''}" 
           id="bar-${c.id}">
        <div class="b-budget-dashed"></div>
        <div class="b-fill" style="height: ${fillHeight}px; background: ${fillColor};"></div>
        <div class="b-icon">${c.icon}</div>
        <div class="b-val">${displayStr}</div>
        ${hasBudget && c.type !== 'save_future' ? '<div class="b-pct">' + pct + '%</div>' : ''}
        ${progressHtml}
        ${completedBadge}
        <div class="loader-overlay" id="loader-${c.id}">
          <svg class="loader-svg" viewBox="0 0 40 40">
            <circle class="bg-circle" cx="20" cy="20" r="18" />
            <circle class="progress-circle" id="progress-${c.id}" cx="20" cy="20" r="18" stroke-dashoffset="113.097" />
          </svg>
        </div>
      </div>
    `;
  });

  document.querySelectorAll('.bar-card.completed').forEach(function(el) {
    el.addEventListener('mousedown', function(e) {
      startHold(e, this.id.replace('bar-', ''));
    });
    el.addEventListener('mouseup', cancelHold);
    el.addEventListener('mouseleave', cancelHold);
    el.addEventListener('touchstart', function(e) {
      startHold(e, this.id.replace('bar-', ''));
    });
    el.addEventListener('touchend', cancelHold);
    el.addEventListener('touchcancel', cancelHold);
  });

  checkSavingsAlerts();
  scheduleGuardarEnFirebase(); // FASE 1: cada vez que la app se re-renderiza (agregar tx, categoría, tarjeta, cobro recurrente, cambiar idioma/moneda, etc.) se programa un guardado completo en la nube.
};

const checkSavingsAlerts = function() {
  allCategories.forEach(function(cat) {
    if (deletedCategories[cat.id]) return;

    var isCelebration = (cat.type === 'save_future' || cat.type === 'save_booking');
    var isWarning = (cat.type === 'income' || cat.type === 'expense');
    if (!isCelebration && !isWarning) return;

    var limit = cat.budget > 0 ? cat.budget : (cat.target || 0);
    if (!(limit > 0)) return;

    var pct = getCategoryPct(cat);
    var key = cat.id + '_' + currentMonth;

    if (!notifiedMilestones[key]) {
      notifiedMilestones[key] = {80: false, 90: false, 100: false};
      saveNotifiedMilestones();
    }
    var milestones = notifiedMilestones[key];

    [80, 90, 100].forEach(function(tier) {
      if (pct >= tier && !milestones[tier]) {
        milestones[tier] = true;
        saveNotifiedMilestones();
        if (isCelebration) {
          var msg = tier === 100 ? getNextMessage(completeMessages, completeIndex) : getNextMessage(progressMessages, progressIndex);
          showCustomAlert(msg.emoji, msg.title, msg.text, tier === 100 ? 'positive' : null);
        } else if (isWarning) {
          var isExp = cat.type === 'expense';
          var wTitle = language === 'es'
            ? (isExp ? 'Presupuesto de gasto' : 'Límite de ingresos')
            : (isExp ? 'Spending budget' : 'Income limit');
          var wText = language === 'es'
            ? ('Has alcanzado el ' + tier + '% del ' + (isExp ? 'presupuesto' : 'límite') + ' que definiste para "' + cat.name + '".')
            : ('You\'ve reached ' + tier + '% of the ' + (isExp ? 'budget' : 'limit') + ' you set for "' + cat.name + '".');
          showCustomAlert(isExp ? cat.icon : '⚠️', wTitle, wText, 'warning');
        }
      }
    });
  });
};

const startHold = function(e, catId) {
  if (contractingCardId) return;
  if (holdTimeout) return;
  
  holdStarted = false;
  holdTimeout = setTimeout(function() {
    holdStarted = true;
    holdTimeout = null;
    var loader = document.getElementById('loader-' + catId);
    if (loader) {
      loader.classList.add('active');
      var progressCircle = document.getElementById('progress-' + catId);
      if (progressCircle) {
        var offset = 113.097;
        var startTime = Date.now();
        if (loaderInterval) clearInterval(loaderInterval);
        loaderInterval = setInterval(function() {
          var elapsed = (Date.now() - startTime) / 3000;
          if (elapsed >= 1) {
            clearInterval(loaderInterval);
            loaderInterval = null;
            progressCircle.style.strokeDashoffset = 0;
            progressCircle.classList.add('done');
            setTimeout(function() {
              if (loader) loader.classList.remove('active');
              handleCompletedClick(catId);
            }, 200);
            return;
          }
          progressCircle.style.strokeDashoffset = offset * (1 - elapsed);
        }, 50);
      }
    }
  }, 1000);
};

const cancelHold = function() {
  if (holdTimeout) {
    clearTimeout(holdTimeout);
    holdTimeout = null;
  }
  if (loaderInterval) {
    clearInterval(loaderInterval);
    loaderInterval = null;
  }
  document.querySelectorAll('.loader-overlay.active').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelectorAll('.progress-circle').forEach(function(el) {
    el.style.strokeDashoffset = 113.097;
    el.classList.remove('done');
  });
};

const handleCompletedClick = function(catId) {
  if (contractingCardId) return;
  contractingCardId = catId;
  var card = document.getElementById('bar-' + catId);
  if (!card) return;
  
  createExplosion(card);
  card.classList.add('contracting');
  deletedCategories[catId] = true;
  localStorage.setItem('deletedCategories_v28', JSON.stringify(deletedCategories));
  
  setTimeout(function() {
    if (card.parentNode) {
      card.remove();
    }
    contractingCardId = null;
    renderApp();
  }, 600);
};

const createExplosion = function(card) {
  var rect = card.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var container = document.createElement('div');
  container.className = 'particle-container';
  document.body.appendChild(container);
  
  var colors = ['#f9d423', '#f7971e', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6ab04c'];
  for (var i = 0; i < 30; i++) {
    var particle = document.createElement('div');
    particle.className = 'particle';
    var size = 6 + Math.random() * 14;
    var angle = Math.random() * 2 * Math.PI;
    var distance = 40 + Math.random() * 120;
    var tx = Math.cos(angle) * distance;
    var ty = Math.sin(angle) * distance;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = cx + 'px';
    particle.style.top = cy + 'px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
    container.appendChild(particle);
  }
  setTimeout(function() {
    container.remove();
  }, 1000);
};

const updateGlobalSlider = function(val) {
  globalNotificationThreshold = parseInt(val);
  document.getElementById('globalSliderDisplay').innerText = val + '%';
};

const updateCustomSlider = function(val) {
  document.getElementById('customSliderDisplay').innerText = val + '%';
};

const colorOptions = [
  '#FFB3B3', '#FFD1B3', '#FFECB3', '#B3FFB3', '#B3ECFF', '#B3B3FF', '#D1B3FF', '#ECB3FF', '#FFB3EC'
];

const renderColorPalette = function(selectedColor) {
  var palette = document.getElementById('colorPalette');
  palette.innerHTML = '';
  colorOptions.forEach(function(color) {
    var swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    if (color === selectedColor) swatch.classList.add('selected');
    swatch.style.background = color;
    swatch.setAttribute('data-color', color);
    swatch.onclick = function() {
      selectCategoryColor(color);
    };
    palette.appendChild(swatch);
  });
};

const selectCategoryColor = function(color) {
  if (!customSliderTargetId) return;
  categoryColors[customSliderTargetId] = color;
  localStorage.setItem('categoryColors_v28', JSON.stringify(categoryColors));
  renderColorPalette(color);
  renderApp();
};
window.selectCategoryColor = selectCategoryColor;

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

// ===== BÚSQUEDA SIN IMPORTAR TILDES =====
// "prestamo" debe encontrar "Préstamo" y viceversa. Quita los acentos antes
// de comparar, en vez de exigir una coincidencia exacta de caracteres.
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
  scheduleGuardarEnFirebase(); // FALTABA: crear categoría desde el asistente de cobro recurrente tampoco guardaba en la nube.

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

document.getElementById('btnMinus').onclick = function() { txType = 'expense'; updateModalColorsAndType(); };
document.getElementById('btnPlus').onclick = function() { txType = 'income'; updateModalColorsAndType(); };
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
    // Si la transacción se guardó en una moneda que el usuario ya no tiene
    // configurada, se agrega igual como opción para no perder el dato.
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

window.deleteCurrentEditingTx = function() {
  if(editingTxId) {
    transactions = transactions.filter(function(t) { return t.id !== editingTxId; });
    document.getElementById('addModal').classList.remove('open');
    alertedCategories = {};
    renderApp();
    scheduleGuardarEnFirebase();
  }
};

window.saveTransaction = function() {
  var desc = document.getElementById('inputDesc').value.trim();
  var rawStr = inpAmt.dataset.raw || '';
  var amount = parseFloat(rawStr);

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

// ===== CONEXIÓN A FIREBASE (DEFINITIVA) - Código JS =====
// (Los scripts de Firebase CDN se cargan en el HTML)
const firebaseConfig = {
  apiKey: "AIzaSyDY8LTbU5bwUJHhp3xmSe0ru0UV4siuTmA",
  authDomain: "mis-finanzas-app-2d508.firebaseapp.com",
  projectId: "mis-finanzas-app-2d508",
  storageBucket: "mis-finanzas-app-2d508.firebasestorage.app",
  messagingSenderId: "93452152715",
  appId: "1:93452152715:web:f57900f5caeb2aaa07898e",
  measurementId: "G-3C1H4X4717"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
try { db.enablePersistence({ synchronizeTabs: true }).catch(function() {}); } catch (e) {}

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

// ===== SERVICE WORKER: REGISTRO CON AUTO-ACTUALIZACIÓN =====
// Antes el Service Worker guardaba app.js/index.html/style.css en caché y los
// servía SIEMPRE desde ahí ("cache-first"), por eso aunque subieras un
// archivo nuevo a Firebase, tu navegador seguía mostrando la versión vieja
// indefinidamente hasta que alguien limpiara el caché a mano.
//
// El nuevo sw.js (que va aparte, ver instrucciones) usa la estrategia
// contraria — "network-first": cada vez que hay internet, pide el archivo
// real y fresco del servidor primero, y solo si NO hay internet usa lo que
// tenga guardado en caché. Así los cambios se ven casi al instante, y la app
// sigue funcionando offline como respaldo.
//
// Este bloque además detecta cuando el navegador terminó de instalar una
// versión nueva del Service Worker y recarga la página automáticamente UNA
// sola vez, para que no tengas ni que cerrar la pestaña.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then((reg) => console.log('✅ Service Worker registrado (network-first)', reg))
    .catch((err) => console.error('❌ Error SW:', err));

  // El SW avisa cuando detecta archivos nuevos en el servidor: recargamos cuando
  // sales de la app o vuelves a ella (nunca en medio de lo que estas haciendo).
  let _updatePendiente = false;
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'app-updated') _updatePendiente = true;
  });
  document.addEventListener('visibilitychange', () => {
    if (_updatePendiente) { _updatePendiente = false; window.location.reload(); }
  });

  let yaRecargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yaRecargando) return;
    yaRecargando = true;
    console.log('🔄 Nueva versión de la app activada, recargando...');
    window.location.reload();
  });
}
// ================================================================
// ===== SECCIÓN "RECOMENDACIÓN" (independiente del resto de la app) =====
// Ayuda a decidir si es buen momento para comprar o vender moneda
// extranjera. API de tasas: @fawazahmed0/currency-api vía jsDelivr, que sí
// cubre COP (frankfurter.app no la tiene y por eso se reemplazó).
// ================================================================

const RECO_DAY_CACHE_PREFIX = 'recoDia_v2_';
const RECO_RATE_PREFIX = 'recoRate_v2_';
const RECO_SELECTION_KEY = 'recoSelection_v2';
const RECO_LOG_KEY = 'recoHistoryLog_v1';
const RECO_DAYS_TOTAL = 90; // fijo, sin selector de rango
const RECO_DAYS_TIMEOUT_MS = 5000;

let recoMode = 'buy'; // 'buy' | 'sell'
let recoLocal = 'COP';
let recoForeign = 'USD';
let recoFetchToken = 0; // evita pintar una respuesta vieja si el usuario cambia rapido de moneda
let recoCachedRate = null;
let recoCachedPoints = null;

function recoLoadSelection() {
  try {
    var raw = localStorage.getItem(RECO_SELECTION_KEY);
    if (raw) {
      var s = JSON.parse(raw);
      recoMode = s.mode || 'buy';
      recoLocal = s.local || 'COP';
      recoForeign = s.foreign || 'USD';
    }
  } catch (e) {}
}
function recoSaveSelection() {
  try { localStorage.setItem(RECO_SELECTION_KEY, JSON.stringify({ mode: recoMode, local: recoLocal, foreign: recoForeign })); } catch (e) {}
}

// Tasa de respaldo con las tasas en vivo que ya usa el resto de la app
// (currencyRates, base COP), por si la API de tasas falla del todo.
function recoRateFallbackDesdeApp(from, to) {
  if (!currencyRates || Object.keys(currencyRates).length === 0) return null;
  if (from === to) return 1;
  if (from === 'COP') return currencyRates[to] || null;
  if (to === 'COP') return currencyRates[from] ? 1 / currencyRates[from] : null;
  if (currencyRates[from] && currencyRates[to]) return currencyRates[to] / currencyRates[from];
  return null;
}

// ===== Tasa de HOY: @fawazahmed0/currency-api@latest =====
function recoFetchLatest(from, to) {
  if (from === to) return Promise.resolve(1);
  var url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/' + from.toLowerCase() + '.json';
  return fetch(url).then(function(r) { if (!r.ok) throw new Error('bad status'); return r.json(); })
    .then(function(data) {
      var rate = data && data[from.toLowerCase()] && data[from.toLowerCase()][to.toLowerCase()];
      if (typeof rate !== 'number') throw new Error('sin tasa');
      try { localStorage.setItem(RECO_RATE_PREFIX + from + '_' + to, JSON.stringify({ rate: rate, ts: Date.now() })); } catch (e) {}
      return rate;
    })
    .catch(function() {
      var fb = recoRateFallbackDesdeApp(from, to);
      if (fb) return fb;
      try {
        var raw = localStorage.getItem(RECO_RATE_PREFIX + from + '_' + to);
        if (raw) return JSON.parse(raw).rate;
      } catch (e) {}
      return null;
    });
}

function recoFechaISO(d) { return d.toISOString().slice(0, 10); }

function recoUltimasFechas(n) {
  var arr = [];
  for (var i = n - 1; i >= 0; i--) {
    var dt = new Date();
    dt.setDate(dt.getDate() - i);
    arr.push(recoFechaISO(dt));
  }
  return arr;
}

// Tasa de UN día puntual: @fawazahmed0/currency-api@YYYY-MM-DD.
// Se cachea en localStorage 24h para no repetir la misma petición dos veces.
function recoFetchRateDia(from, to, fechaStr) {
  if (from === to) return Promise.resolve(1);
  var cacheKey = RECO_DAY_CACHE_PREFIX + fechaStr + '_' + from + '_' + to;
  try {
    var raw = localStorage.getItem(cacheKey);
    if (raw) {
      var cached = JSON.parse(raw);
      if (Date.now() - cached.ts < 24 * 60 * 60 * 1000) return Promise.resolve(cached.rate);
    }
  } catch (e) {}
  var url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@' + fechaStr + '/v1/currencies/' + from.toLowerCase() + '.json';
  return fetch(url).then(function(r) { if (!r.ok) throw new Error('bad status'); return r.json(); })
    .then(function(data) {
      var rate = data && data[from.toLowerCase()] && data[from.toLowerCase()][to.toLowerCase()];
      if (typeof rate !== 'number') throw new Error('sin tasa');
      try { localStorage.setItem(cacheKey, JSON.stringify({ rate: rate, ts: Date.now() })); } catch (e) {}
      return rate;
    })
    .catch(function() {
      try {
        var raw2 = localStorage.getItem(cacheKey);
        if (raw2) return JSON.parse(raw2).rate; // mejor una tasa vieja que ninguna
      } catch (e) {}
      return null;
    });
}

// Histórico de 90 días. Si tarda más de 5 segundos, se usan solo los
// últimos 30 días para no dejar a la persona esperando.
function recoFetchHistory90(from, to) {
  if (from === to) return Promise.resolve(null);
  var fechas90 = recoUltimasFechas(RECO_DAYS_TOTAL);
  var pedir = function(fechas) {
    return Promise.all(fechas.map(function(f) {
      return recoFetchRateDia(from, to, f).then(function(rate) { return { date: f, rate: rate }; });
    })).then(function(arr) { return arr.filter(function(p) { return typeof p.rate === 'number'; }); });
  };

  var promesa90 = pedir(fechas90);
  var timeout = new Promise(function(resolve) { setTimeout(function() { resolve('TIMEOUT'); }, RECO_DAYS_TIMEOUT_MS); });

  return Promise.race([promesa90, timeout]).then(function(res) {
    if (res !== 'TIMEOUT') return res;
    // Se tardó demasiado: nos conformamos con los últimos 30 días.
    return pedir(fechas90.slice(-30));
  });
}

// Percentil por interpolación lineal sobre un arreglo YA ordenado ascendente.
function recoPercentil(sortedArr, p) {
  var idx = (p / 100) * (sortedArr.length - 1);
  var lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  var w = idx - lo;
  return sortedArr[lo] * (1 - w) + sortedArr[hi] * w;
}

function recoSemaforo(current, p25, p75, mode) {
  // En "vender" la logica es inversa: precio ALTO es favorable (mas pesos
  // por cada dolar vendido), precio BAJO es desfavorable.
  if (mode === 'sell') {
    if (current >= p75) return 'green';
    if (current <= p25) return 'red';
    return 'yellow';
  }
  if (current <= p25) return 'green';
  if (current >= p75) return 'red';
  return 'yellow';
}

function recoFmtTasa(v) {
  var decimals = v < 10 ? 4 : (v < 100 ? 2 : 0);
  return v.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

// ===== TENDENCIA de los últimos 30 días (independiente del semáforo) =====
function recoCalcularTendencia(points) {
  var ultimos = points.slice(-30);
  if (ultimos.length < 2) return null;
  var inicio = ultimos[0].rate, fin = ultimos[ultimos.length - 1].rate;
  var pctCambio = ((fin - inicio) / inicio) * 100;
  var direccion = Math.abs(pctCambio) < 1 ? 'estable' : (pctCambio < 0 ? 'bajando' : 'subiendo');
  var diasConsecutivos = 1;
  for (var i = ultimos.length - 1; i > 0; i--) {
    if (direccion === 'bajando' && ultimos[i].rate <= ultimos[i - 1].rate) diasConsecutivos++;
    else if (direccion === 'subiendo' && ultimos[i].rate >= ultimos[i - 1].rate) diasConsecutivos++;
    else break;
  }
  return { direccion: direccion, pctCambio: pctCambio, inicio: inicio, fin: fin, dias: ultimos.length, diasConsecutivos: diasConsecutivos, puntos: ultimos };
}

// ===== "MAPA" de tendencia: mini barras coloreadas (sin librerías) =====
function recoBuildTrendBars(points, colorHex) {
  var vals = points.map(function(p) { return p.rate; });
  var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  if (min === max) max = min + (Math.abs(min) * 0.001 || 1);
  var barras = points.map(function(p) {
    var h = 8 + ((p.rate - min) / (max - min)) * 56;
    return '<div style="flex:1; min-width:2px; background:' + colorHex + '; opacity:0.85; border-radius:3px 3px 0 0; height:' + h.toFixed(1) + 'px;"></div>';
  }).join('');
  return '<div style="display:flex; align-items:flex-end; gap:2px; height:70px; width:100%; padding:0 2px;">' + barras + '</div>';
}

// ===== HISTORIAL DE RECOMENDACIONES (últimas 30, dedupe por día+par+modo) =====
function recoLogHistoryEntry(color, rate) {
  var log = [];
  try { log = JSON.parse(localStorage.getItem(RECO_LOG_KEY) || '[]'); } catch (e) {}
  var today = new Date().toISOString().slice(0, 10);
  var pairKey = recoForeign + '/' + recoLocal;
  var existente = log.find(function(e) { return e.date === today && e.pair === pairKey && e.mode === recoMode; });
  if (existente) {
    existente.color = color; existente.rate = rate;
  } else {
    log.unshift({ date: today, pair: pairKey, mode: recoMode, color: color, rate: rate });
  }
  if (log.length > 30) log.length = 30;
  try { localStorage.setItem(RECO_LOG_KEY, JSON.stringify(log)); } catch (e) {}
}

window.recoOpenHistoryModal = function() {
  var log = [];
  try { log = JSON.parse(localStorage.getItem(RECO_LOG_KEY) || '[]'); } catch (e) {}
  var es = language === 'es';
  var pairKey = recoForeign + '/' + recoLocal;
  var filtrado = log.filter(function(e) { return e.pair === pairKey && e.mode === recoMode; });
  var listEl = document.getElementById('recoHistoryList');
  if (!filtrado.length) {
    listEl.innerHTML = '<div class="reco-empty">' + (es ? 'Aún no hay historial para este par.' : 'No history yet for this pair.') + '</div>';
  } else {
    listEl.innerHTML = filtrado.map(function(e) {
      var dot = e.color === 'green' ? '🟢' : e.color === 'red' ? '🔴' : '🟡';
      return '<div class="reco-history-row"><span>' + dot + ' ' + e.date + '</span><span>' + e.pair + '</span><span>' +
             recoFmtTasa(e.rate) + '</span></div>';
    }).join('');
  }
  document.getElementById('recoHistoryModal').classList.add('open');
};

// ===== UI: pestañas, selects, monto, resultado =====
window.recoBuildCurrencySelects = function() {
  var optsHtml = currencyCatalog.map(function(c) { return '<option value="' + c.code + '">' + c.flag + ' ' + c.code + '</option>'; }).join('');
  document.getElementById('recoLocalSelect').innerHTML = optsHtml;
  document.getElementById('recoForeignSelect').innerHTML = optsHtml;
  document.getElementById('recoLocalSelect').value = recoLocal;
  document.getElementById('recoForeignSelect').value = recoForeign;
};

window.recoUpdateLabelsUI = function() {
  var es = language === 'es';
  if (recoMode === 'buy') {
    document.getElementById('recoLocalLabel').innerText = es ? 'Moneda local' : 'Local currency';
    document.getElementById('recoForeignLabel').innerText = es ? 'Moneda a comprar' : 'Currency to buy';
    document.getElementById('recoAmountLabel').innerText = (es ? 'Monto en ' : 'Amount in ') + recoLocal;
  } else {
    document.getElementById('recoLocalLabel').innerText = es ? 'Moneda local destino' : 'Destination local currency';
    document.getElementById('recoForeignLabel').innerText = es ? 'Moneda extranjera' : 'Foreign currency';
    document.getElementById('recoAmountLabel').innerText = (es ? 'Monto en ' : 'Amount in ') + recoForeign;
  }
};

window.recoOnCurrencyChange = function(which) {
  var localSel = document.getElementById('recoLocalSelect');
  var foreignSel = document.getElementById('recoForeignSelect');
  if (which === 'local') recoLocal = localSel.value; else recoForeign = foreignSel.value;
  if (recoLocal === recoForeign) {
    var alt = currencyCatalog.find(function(c) { return c.code !== recoLocal; });
    if (which === 'local') { recoForeign = alt.code; foreignSel.value = alt.code; }
    else { recoLocal = alt.code; localSel.value = alt.code; }
  }
  recoUpdateLabelsUI();
  recoRefresh();
};

window.recoSetTab = function(mode) {
  recoMode = mode;
  document.getElementById('recoTabBuy').classList.toggle('active', mode === 'buy');
  document.getElementById('recoTabSell').classList.toggle('active', mode === 'sell');
  recoUpdateLabelsUI();
  recoRefresh();
};

window.recoOnAmountInput = function() {
  recoRenderResultado(recoCachedRate, recoCachedPoints);
};

function recoRenderResultado(rate, points) {
  var box = document.getElementById('recoChartBox');
  var resultEl = document.getElementById('recoResultText');
  var trendHeaderEl = document.getElementById('recoTrendHeader');
  var trendBigEl = document.getElementById('recoTrendBig');
  var circleEl = document.getElementById('recoSemaforoCircle');
  var circleLabelEl = document.getElementById('recoSemaforoLabel');
  var analisisEl = document.getElementById('recoAnalisis');
  var es = language === 'es';

  if (!rate) {
    box.innerHTML = '<div class="reco-empty">' + (es ? 'No se pudo conectar. Verifica tu internet.' : 'Could not connect. Check your internet.') + '</div>';
    resultEl.innerText = '';
    trendHeaderEl.innerHTML = ''; trendHeaderEl.className = 'reco-trend-header';
    trendBigEl.innerText = '';
    circleEl.style.display = 'none'; circleLabelEl.innerText = '';
    analisisEl.innerText = '';
    return;
  }
  circleEl.style.display = 'flex';

  var amountRaw = (document.getElementById('recoAmountInput').value || '').replace(/,/g, '');
  var amount = parseFloat(amountRaw) || 0;

  if (recoMode === 'buy') {
    var obtenidoForeign = amount / rate;
    resultEl.innerText = (es ? 'Con ' : 'With ') + amount.toLocaleString('en-US') + ' ' + recoLocal +
      (es ? ' obtendrías hoy ≈ ' : ' you would get today ≈ ') + obtenidoForeign.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + recoForeign;
  } else {
    var obtenidoLocal = amount * rate;
    resultEl.innerText = (es ? 'Con ' : 'With ') + amount.toLocaleString('en-US') + ' ' + recoForeign +
      (es ? ' obtendrías hoy ≈ ' : ' you would get today ≈ ') + obtenidoLocal.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + recoLocal;
  }

  if (!points || points.length < 2) {
    box.innerHTML = '<div class="reco-empty">' + (es ? 'No se pudo conectar. Verifica tu internet.' : 'Could not connect. Check your internet.') + '</div>';
    trendHeaderEl.innerHTML = ''; trendHeaderEl.className = 'reco-trend-header';
    trendBigEl.innerText = '';
    circleEl.style.display = 'none'; circleLabelEl.innerText = '';
    analisisEl.innerText = '';
    return;
  }

  // ----- Semáforo (percentiles de todo el histórico disponible) -----
  var vals = points.map(function(p) { return p.rate; }).slice().sort(function(a, b) { return a - b; });
  var p25 = recoPercentil(vals, 25), p75 = recoPercentil(vals, 75);
  var avg = vals.reduce(function(s, v) { return s + v; }, 0) / vals.length;
  var colorSemaforo = recoSemaforo(rate, p25, p75, recoMode);
  var diffPct = ((rate - avg) / avg) * 100;

  var textosCirculo = {
    green: recoMode === 'buy' ? (es ? 'BUEN MOMENTO PARA COMPRAR' : 'GOOD TIME TO BUY') : (es ? 'BUEN MOMENTO PARA VENDER' : 'GOOD TIME TO SELL'),
    yellow: recoMode === 'buy' ? (es ? 'ESPERA UN POCO' : 'WAIT A BIT') : (es ? 'ESPERA, PUEDE SUBIR' : 'WAIT, IT MAY RISE'),
    red: recoMode === 'buy' ? (es ? 'NO COMPRES TODAVÍA' : "DON'T BUY YET") : (es ? 'NO VENDAS AHORA' : "DON'T SELL NOW")
  };
  var iconosCirculo = { green: '🟢', yellow: '🟡', red: '🔴' };
  circleEl.className = 'reco-semaforo-circle ' + colorSemaforo;
  circleEl.innerText = iconosCirculo[colorSemaforo];
  circleLabelEl.className = 'reco-semaforo-label ' + colorSemaforo;
  circleLabelEl.innerText = textosCirculo[colorSemaforo];

  // ----- Tendencia de los últimos 30 días (sube/baja/estable) -----
  var tendencia = recoCalcularTendencia(points);
  if (tendencia) {
    var colorTendenciaHex = tendencia.direccion === 'bajando' ? '#34c759' : tendencia.direccion === 'subiendo' ? '#ff4b4b' : '#ffb020';
    var colorTendenciaClase = tendencia.direccion === 'bajando' ? 'green' : tendencia.direccion === 'subiendo' ? 'red' : 'yellow';
    var iconoTendencia = tendencia.direccion === 'bajando' ? '📉' : tendencia.direccion === 'subiendo' ? '📈' : '➡️';
    var palabraTendencia = tendencia.direccion === 'bajando' ? (es ? 'BAJANDO' : 'DOWN') : tendencia.direccion === 'subiendo' ? (es ? 'SUBIENDO' : 'UP') : (es ? 'ESTABLE' : 'STABLE');

    trendHeaderEl.className = 'reco-trend-header ' + colorTendenciaClase;
    trendHeaderEl.innerHTML = iconoTendencia + ' ' + palabraTendencia;
    box.innerHTML = recoBuildTrendBars(tendencia.puntos, colorTendenciaHex);

    var nombreMoneda = getCurrencyInfo(recoForeign).flag + ' ' + recoForeign;
    var consejoTendencia;
    if (recoMode === 'buy') {
      consejoTendencia = tendencia.direccion === 'bajando' ? (es ? 'Va por buen camino para comprar.' : 'Looking good for buying.')
        : tendencia.direccion === 'subiendo' ? (es ? 'Sigue subiendo, mejor espera para comprar.' : "It's still rising, better wait to buy.")
        : (es ? 'Se mantiene estable.' : "It's holding steady.");
    } else {
      consejoTendencia = tendencia.direccion === 'subiendo' ? (es ? 'Va por buen camino para vender.' : 'Looking good for selling.')
        : tendencia.direccion === 'bajando' ? (es ? 'Sigue bajando, mejor espera para vender.' : "It's still falling, better wait to sell.")
        : (es ? 'Se mantiene estable.' : "It's holding steady.");
    }
    trendBigEl.innerText = (es
      ? (nombreMoneda + ' está ' + palabraTendencia + '. Hace ' + tendencia.dias + ' días valía $' + recoFmtTasa(tendencia.inicio) + ', hoy vale $' + recoFmtTasa(tendencia.fin) + '. ' + consejoTendencia)
      : (nombreMoneda + ' is ' + palabraTendencia + '. ' + tendencia.dias + ' days ago it was $' + recoFmtTasa(tendencia.inicio) + ', today it is $' + recoFmtTasa(tendencia.fin) + '. ' + consejoTendencia));

    // ----- Texto de análisis completo -----
    var pctTxt = Math.abs(diffPct).toFixed(1);
    var lineaPrecio = (es ? 'Precio actual: $' : 'Current price: $') + recoFmtTasa(rate) + ' ' + recoLocal + (es ? ' por ' : ' per ') + recoForeign;
    var lineaPromedio = (es ? 'Promedio ' : 'Average ') + points.length + (es ? ' días: $' : ' days: $') + recoFmtTasa(avg) + ' ' + recoLocal;
    var lineaComparacion;
    if (recoMode === 'buy') {
      lineaComparacion = diffPct < 0
        ? (es ? ('Estás comprando ' + pctTxt + '% más barato que el promedio.') : ('You are buying ' + pctTxt + '% cheaper than average.'))
        : (es ? ('Estás comprando ' + pctTxt + '% más caro que el promedio.') : ('You are buying ' + pctTxt + '% more expensive than average.'));
    } else {
      lineaComparacion = diffPct > 0
        ? (es ? ('Estás vendiendo ' + pctTxt + '% más caro que el promedio.') : ('You are selling ' + pctTxt + '% more expensive than average.'))
        : (es ? ('Estás vendiendo ' + pctTxt + '% más barato que el promedio.') : ('You are selling ' + pctTxt + '% cheaper than average.'));
    }
    var resumenSemaforo = colorSemaforo === 'green' ? (es ? 'Buen momento.' : 'Good time.') : colorSemaforo === 'red' ? (es ? 'Momento desfavorable.' : 'Unfavorable time.') : (es ? 'Momento neutro.' : 'Neutral time.');
    var lineaDias = es
      ? ('El precio lleva ' + tendencia.diasConsecutivos + ' día' + (tendencia.diasConsecutivos === 1 ? '' : 's') + ' ' + tendencia.direccion + '. ' + resumenSemaforo)
      : ('The price has been ' + tendencia.direccion + ' for ' + tendencia.diasConsecutivos + ' day' + (tendencia.diasConsecutivos === 1 ? '' : 's') + '. ' + resumenSemaforo);
    analisisEl.innerText = [lineaPrecio, lineaPromedio, lineaComparacion, lineaDias].join('\n');
  } else {
    trendHeaderEl.innerHTML = ''; trendHeaderEl.className = 'reco-trend-header';
    trendBigEl.innerText = '';
    box.innerHTML = '<div class="reco-empty">' + (es ? 'No hay suficientes días para ver la tendencia.' : 'Not enough days to show a trend.') + '</div>';
    analisisEl.innerText = '';
  }

  recoLogHistoryEntry(colorSemaforo, rate);
}

function recoRefresh() {
  if (recoLocal === recoForeign) {
    var alt = currencyCatalog.find(function(c) { return c.code !== recoLocal; });
    recoForeign = alt ? alt.code : 'USD';
  }
  recoSaveSelection();
  var box = document.getElementById('recoChartBox');
  var es = language === 'es';
  box.innerHTML = '<div class="reco-loading">' + (es ? 'Cargando histórico…' : 'Loading history…') + '</div>';
  document.getElementById('recoSemaforoCircle').style.display = 'none';
  document.getElementById('recoSemaforoLabel').innerText = '';
  document.getElementById('recoTrendHeader').innerHTML = '';
  document.getElementById('recoTrendBig').innerText = '';
  document.getElementById('recoAnalisis').innerText = '';

  var myToken = ++recoFetchToken;
  Promise.all([
    recoFetchLatest(recoForeign, recoLocal),
    recoFetchHistory90(recoForeign, recoLocal)
  ]).then(function(res) {
    if (myToken !== recoFetchToken) return; // el usuario ya cambio de pareja mientras tanto
    recoCachedRate = res[0];
    recoCachedPoints = res[1];
    recoRenderResultado(recoCachedRate, recoCachedPoints);
  });
}

window.openRecommendation = function() {
  closeSettings();
  recoLoadSelection();
  recoBuildCurrencySelects();
  document.getElementById('recoTabBuy').classList.toggle('active', recoMode === 'buy');
  document.getElementById('recoTabSell').classList.toggle('active', recoMode === 'sell');
  recoUpdateLabelsUI();
  document.getElementById('recoAmountInput').value = '';
  document.getElementById('recoModal').classList.add('open');
  lastActiveModal = 'recommendation';
  recoRefresh();
};

window.closeRecommendation = function() {
  document.getElementById('recoModal').classList.remove('open');
  openSettings();
};

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