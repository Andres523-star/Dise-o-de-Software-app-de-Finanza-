### HU-13: Abonar a una meta de ahorro

**Como** usuario
**Quiero** hacer abonos a mi meta desde una de mis cuentas
**Para** avanzar en mi ahorro

**Validación INVEST**
- I — Independent: ⚠️ Necesita una meta creada (HU-12).
- N — Negotiable: ✅ No define la interfaz.
- V — Valuable: ✅ Es la forma de avanzar en la meta.
- E — Estimable: ✅ Regla clara: debe haber saldo en la cuenta.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ Saldos y progreso verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Abonos a una meta

  Escenario: Abono válido
    Dado que "Nu" tiene 2.847.000
    Y la meta "Viaje a Cartagena" tiene 0 de 2.000.000
    Cuando abono 500.000 desde "Nu"
    Entonces "Nu" queda con 2.347.000
    Y la meta queda con 500.000 y 25 % de progreso

  Escenario: Abono sin saldo suficiente
    Dado que "Efectivo" tiene saldo 0
    Cuando intento abonar 100.000 desde "Efectivo"
    Entonces el sistema responde "No tienes esa cantidad disponible en Efectivo"
    Y la meta no cambia

  Escenario: Completar la meta
    Dado que a la meta le faltan 100.000
    Cuando abono 100.000
    Entonces la meta queda completada al 100 %
    Y recibo la notificación "🎉 ¡Meta cumplida!"
```

**Supuestos / preguntas abiertas**
- "Tomar de balance" (apartar del balance del mes sin elegir cuenta) existe en la PWA; en la API se modela como una transacción de tipo AHORRO.
