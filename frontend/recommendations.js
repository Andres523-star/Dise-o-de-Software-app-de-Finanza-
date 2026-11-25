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
//  TRM: trae la tasa de HOY (Analista Financiero)
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
// 📌 PRESENTACION 5 - TRM: trae el historial de 90 días
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

// 📌 PRESENTACION 5 - TRM: semáforo verde / amarillo / rojo
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

