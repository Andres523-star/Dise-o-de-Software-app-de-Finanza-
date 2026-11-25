### HU-08: Editar o eliminar una transacción

**Como** usuario
**Quiero** corregir o borrar una transacción
**Para** que mis saldos queden exactos si me equivoco

**Validación INVEST**
- I — Independent: ⚠️ Necesita que se puedan registrar transacciones (HU-05/HU-06), que son del mismo sprint.
- N — Negotiable: ✅ No define la interfaz de edición.
- V — Valuable: ✅ Evita saldos equivocados.
- E — Estimable: ✅ Regla clara: deshacer la vieja y aplicar la nueva.
- S — Small: ✅ 2 puntos.
- T — Testable: ✅ Saldos antes y después verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Editar y eliminar transacciones

  Escenario: Editar el monto y la cuenta de un gasto
    Dado que registré un gasto de 200.000 con la cuenta "Nu"
    Y "Nu" quedó con 2.647.000 y "Nequi" tiene 288.000
    Cuando edito el gasto a 50.000 con la cuenta "Nequi"
    Entonces "Nu" vuelve a 2.847.000
    Y "Nequi" queda en 238.000

  Escenario: Eliminar un gasto
    Dado que registré un gasto de 50.000 con la cuenta "Nequi"
    Cuando elimino el gasto
    Entonces el gasto ya no aparece en el historial
    Y el saldo de "Nequi" aumenta en 50.000

  Escenario: Edición que deja un ahorro sin fondos
    Dado que tengo un ahorro de 10.000 desde "Efectivo"
    Cuando lo edito a 99.999.999
    Entonces el sistema responde "No tienes esa cantidad disponible"
    Y los saldos quedan como estaban

  Escenario: Transacción inexistente
    Cuando intento eliminar la transacción "no-existe"
    Entonces el sistema responde "No se encontró Transacción: no-existe"
```

**Supuestos / preguntas abiertas**
- La confirmación antes de eliminar es parte de la interfaz de la PWA, no de la API.
