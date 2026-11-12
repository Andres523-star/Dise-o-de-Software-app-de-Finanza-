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


