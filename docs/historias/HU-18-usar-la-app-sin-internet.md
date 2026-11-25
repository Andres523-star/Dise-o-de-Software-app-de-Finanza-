### HU-18: Instalar la app y usarla sin internet

**Como** usuario
**Quiero** instalar Mis Finanzas en mi celular y registrar movimientos sin conexión
**Para** usarla en cualquier lugar

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ No dice cómo se guarda la copia local.
- V — Valuable: ✅ La app sirve aunque no haya datos móviles.
- E — Estimable: ✅ Usa Service Worker y caché del navegador.
- S — Small: ⚠️ 5 puntos.
- T — Testable: ✅ Se prueba en modo avión.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: App instalable y sin conexión

  Escenario: Instalar la app
    Dado que abro Mis Finanzas en el navegador del celular
    Cuando elijo "Agregar a pantalla de inicio"
    Entonces aparece el ícono de Mis Finanzas en mi celular

  Escenario: Abrir sin internet
    Dado que ya abrí la app antes con conexión
    Y el celular está en modo avión
    Cuando abro la app
    Entonces la app carga con mis datos guardados

  Escenario: Sincronizar al volver la conexión
    Dado que registré un gasto sin conexión
    Cuando vuelve la conexión
    Entonces el gasto se guarda en la nube
```

**Supuestos / preguntas abiertas**
- Implementado en la PWA (sw.js y caché de Firestore); no aplica a la API Java.
