### HU-07: Manejar varias cuentas (Efectivo, Nequi, Nu)

**Como** usuario
**Quiero** tener varias cuentas, cada una con su propio saldo
**Para** saber cuánto dinero tengo en cada lugar

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ Los tipos de cuenta se pueden ampliar.
- V — Valuable: ✅ Refleja cómo maneja la gente su dinero en Colombia.
- E — Estimable: ✅ Datos claros: nombre, tipo, color y saldo.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ Saldos y suma total verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Cuentas

  Escenario: Crear una cuenta
    Cuando creo la cuenta "Bancolombia" de tipo "BANCO" con saldo inicial 500.000
    Entonces la cuenta aparece en la lista de cuentas del tablero con saldo 500.000

  Escenario: El balance total suma todas las cuentas
    Dado que "Nu" tiene 2.847.000, "Nequi" 288.000 y "Efectivo" 0
    Cuando consulto el tablero
    Entonces el balance total es 3.135.000

  Escenario: Cuenta sin tipo
    Cuando intento crear una cuenta sin tipo
    Entonces el sistema responde "El tipo es obligatorio (EFECTIVO, BILLETERA_DIGITAL o BANCO)"

  Escenario: Saldo inicial negativo
    Cuando intento crear una cuenta con saldo inicial -1
    Entonces el sistema responde "El saldo inicial no puede ser negativo"
```

**Supuestos / preguntas abiertas**
- Filtrar el balance por cuenta se cubre en HU-21.
