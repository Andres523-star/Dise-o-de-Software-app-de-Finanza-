### HU-21: Ver el balance y el resumen del mes

**Como** usuario
**Quiero** ver en la pantalla principal mi balance, ingresos, gastos y ahorro del mes
**Para** entender mi situación de un vistazo

**Validación INVEST**
- I — Independent: ✅ Solo lee lo que ya existe.
- N — Negotiable: ✅ No impone cómo se dibuja el resumen.
- V — Valuable: ✅ Es lo primero que el usuario quiere ver.
- E — Estimable: ✅ Cálculos definidos.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ Los totales son verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Resumen del mes

  Escenario: Ver el resumen
    Dado que este mes tengo ingresos por 3.400.000 y gastos por 265.000
    Cuando consulto el resumen del mes
    Entonces veo ingresos 3.400.000, gastos 265.000 y ahorro 0
    Y el balance del mes es 3.135.000
    Y la cantidad de movimientos es 6

  Escenario: El resumen se actualiza
    Dado que el balance del mes es 3.135.000
    Cuando registro un gasto de 200.000
    Entonces el balance del mes pasa a 2.935.000

  Escenario: Consultar otro mes
    Cuando consulto el resumen de octubre de 2026
    Entonces solo se suman los movimientos de octubre
```

**Supuestos / preguntas abiertas**
- Balance del mes = ingresos − gastos − ahorro.
- Filtrar por cuenta se hace en la PWA; la API devuelve además el saldo total de todas las cuentas.
