### HU-15: Recordatorio push de cobros recurrentes

**Como** usuario
**Quiero** recibir una notificación push antes de un cobro recurrente
**Para** tener el dinero listo

**Validación INVEST**
- I — Independent: ⚠️ Depende de los cobros recurrentes (HU-14).
- N — Negotiable: ✅ La anticipación del aviso se puede conversar.
- V — Valuable: ✅ Evita sorpresas en la cuenta.
- E — Estimable: ✅ Usa un servicio de notificaciones existente (FCM).
- S — Small: ⚠️ 5 puntos.
- T — Testable: ✅ Se verifica que llega la notificación.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Recordatorio de cobros

  Escenario: Aviso antes del cobro
    Dado que tengo las notificaciones activadas
    Y el cobro "Netflix" vence mañana
    Cuando se ejecuta la revisión programada de cobros
    Entonces recibo una notificación push sobre "Netflix"

  Escenario: Aviso con la app cerrada
    Dado que la app está cerrada
    Cuando llega el recordatorio de un cobro
    Entonces la notificación aparece en el celular

  Escenario: Notificaciones desactivadas
    Dado que desactivé las notificaciones
    Cuando se ejecuta la revisión programada de cobros
    Entonces no recibo ninguna notificación

  Escenario: Registro del cobro
    Cuando se genera el cobro "Netflix"
    Entonces queda una notificación "🔁 Cobro registrado: Netflix" con la próxima fecha
```

**Supuestos / preguntas abiertas**
- El envío push real lo hace la Cloud Function de la PWA (checkRecurringReminders); en la API Java el FcmAdapter lo deja registrado en el log.
- No se definió con cuántos días de anticipación se avisa; se asume un día.
