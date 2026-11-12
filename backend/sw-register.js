
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
