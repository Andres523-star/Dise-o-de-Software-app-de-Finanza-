/* ==========================================================================
   functions/index.js
   Esta es la Cloud Function que revisa TODOS los tableros una vez al día y
   envía las notificaciones push de cobros recurrentes que tengan un
   recordatorio programado para hoy.

   REQUIERE plan Blaze (pago por uso) en tu proyecto de Firebase — las
   funciones programadas (scheduled functions) no están disponibles en el
   plan gratuito Spark. El uso normal de una sola persona se queda
   cómodamente dentro de la capa gratuita del plan Blaze (no deberías pagar
   nada en la práctica), pero Firebase igual pide una tarjeta asociada.

   INSTALACIÓN (una sola vez):
     1. En la carpeta raíz de tu proyecto: firebase init functions
        (elige JavaScript, y cuando pregunte si sobreescribir, dile que NO
        si ya tienes una carpeta functions/ — en ese caso solo copia este
        archivo dentro de functions/index.js)
     2. cd functions && npm install firebase-admin firebase-functions
     3. Vuelve a la raíz y corre: firebase deploy --only functions
   ========================================================================== */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ---- Mismas funciones de fecha que usa app.js, portadas a Node.js ----
function pad2(n) { return n < 10 ? ('0' + n) : ('' + n); }
function toISO(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function fromISO(s) { var p = s.split('-'); return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])); }
function addDaysISO(iso, n) { var d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
function addMonthsClamped(iso, n) {
  var d = fromISO(iso); var day = d.getDate();
  var target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  var lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return toISO(target);
}
function addYearsClamped(iso, n) {
  var d = fromISO(iso); var day = d.getDate();
  var target = new Date(d.getFullYear() + n, d.getMonth(), 1);
  var lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return toISO(target);
}
function getStep(rc) {
  if (rc.freq === 'week') return { kind: 'days', n: 7 };
  if (rc.freq === '15days') return { kind: 'days', n: 15 };
  if (rc.freq === 'year') return { kind: 'years', n: 1 };
  if (rc.freq !== 'custom') return { kind: 'months', n: 1 };
  var n = rc.customValue > 0 ? rc.customValue : 1;
  if (rc.customUnit === 'weeks') return { kind: 'days', n: n * 7 };
  if (rc.customUnit === 'months') return { kind: 'months', n: n };
  if (rc.customUnit === 'years') return { kind: 'years', n: n };
  return { kind: 'days', n: n };
}
function advanceISO(iso, rc) {
  var step = getStep(rc);
  if (step.kind === 'days') return addDaysISO(iso, step.n);
  if (step.kind === 'months') return addMonthsClamped(iso, step.n);
  return addYearsClamped(iso, step.n);
}
// Próxima fecha de cobro que sea HOY o en el futuro (igual que rc.lastAppliedDate
// en el cliente, pero recalculado desde cero cada vez porque acá no
// guardamos ese campo).
function nextDueOnOrAfter(rc, todayISO) {
  if (!rc.anchorDate) return null;
  var due = rc.anchorDate;
  var guard = 0;
  while (due < todayISO && guard < 500) { due = advanceISO(due, rc); guard++; }
  return due;
}

exports.checkRecurringReminders = onSchedule(
  { schedule: 'every day 08:00', timeZone: 'America/Bogota' },
  async () => {
    const todayISO = toISO(new Date());
    const tablerosSnap = await db.collection('tableros').get();

    for (const doc of tablerosSnap.docs) {
      const board = doc.data();
      const recurringCharges = board.recurringCharges || [];
      const members = board.members || [];
      if (recurringCharges.length === 0 || members.length === 0) continue;

      const yaNotificado = board.notifiedRecurring || {};
      const nuevosNotificados = {};
      const mensajes = [];

      for (const rc of recurringCharges) {
        if (!rc.notifications || !rc.notifications.length) continue;
        const proximoCobro = nextDueOnOrAfter(rc, todayISO);
        if (!proximoCobro) continue;

        for (const notif of rc.notifications) {
          const fechaAviso = addDaysISO(proximoCobro, -(notif.leadDays || 0));
          const key = rc.id + '_' + notif.leadDays + '_' + proximoCobro;
          if (fechaAviso === todayISO && !yaNotificado[key]) {
            const diasTexto = notif.leadDays === 0 ? 'es hoy' : ('es en ' + notif.leadDays + ' día(s)');
            mensajes.push({
              title: (rc.icon || '💳') + ' ' + rc.name,
              body: 'Tu cobro de $' + Number(rc.amount).toLocaleString('es-CO') + ' ' + diasTexto + '.'
            });
            nuevosNotificados[key] = todayISO;
          }
        }
      }

      if (mensajes.length === 0) continue;

      // Buscar los tokens de todos los miembros del tablero
      const tokens = [];
      for (const uid of members) {
        const userDoc = await db.collection('usuarios').doc(uid).get();
        const userTokens = (userDoc.exists && userDoc.data().fcmTokens) || [];
        tokens.push(...userTokens);
      }
      if (tokens.length === 0) continue;

      for (const msg of mensajes) {
        await messaging.sendEachForMulticast({
          tokens: tokens,
          notification: { title: msg.title, body: msg.body }
        }).catch((err) => console.error('Error enviando push:', err));
      }

      // Guardar cuáles ya se mandaron para no repetir mañana
      await doc.ref.set({
        notifiedRecurring: Object.assign({}, yaNotificado, nuevosNotificados)
      }, { merge: true });
    }

    return null;
  }
);