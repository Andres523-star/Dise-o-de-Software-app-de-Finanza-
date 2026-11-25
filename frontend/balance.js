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

// 📌 PWA 7 - ALERTAS DE PRESUPUESTO: aquí empieza
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

    // 📌 PWA 7 - Revisa los umbrales 80%, 90% y 100%
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

