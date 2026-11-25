### HU-05: Registrar un gasto

**Como** usuario
**Quiero** registrar un gasto con monto, categoría, cuenta, fecha y descripción
**Para** saber en qué se me va el dinero

**Validación INVEST**
- I — Independent: ✅ Se entrega sola (las cuentas y categorías iniciales vienen creadas).
- N — Negotiable: ✅ No define cómo se dibuja el formulario.
- V — Valuable: ✅ Es la función principal de la app.
- E — Estimable: ✅ Datos y validaciones definidos.
- S — Small: ✅ Cabe en un sprint.
- T — Testable: ✅ El saldo y los mensajes son verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Registrar un gasto

  Escenario: Gasto válido
    Dado que la cuenta "Nu" tiene un saldo de 2.847.000
    Cuando registro un gasto de 200.000 en la categoría "Comida" con la cuenta "Nu"
    Entonces el gasto queda guardado con tipo "EGRESO"
    Y el saldo de "Nu" queda en 2.647.000
    Y el gasto aparece en el historial del mes

  Esquema del escenario: Datos inválidos
    Cuando intento registrar un gasto con <dato> igual a <valor>
    Entonces el sistema no guarda el gasto
    Y responde el mensaje "<mensaje>"

    Ejemplos:
      | dato      | valor | mensaje                         |
      | monto     | 0     | El monto debe ser mayor a cero  |
      | monto     | -500  | El monto debe ser mayor a cero  |
      | categoría | vacía | La categoría es obligatoria     |
      | cuenta    | vacía | La cuenta es obligatoria        |

  Escenario: Categoría de otro tipo
    Cuando registro un gasto con la categoría "Salario"
    Entonces el sistema responde que la categoría "Salario" es de tipo INGRESO y la transacción es EGRESO

  Escenario: El gasto puede dejar la cuenta en negativo
    Dado que la cuenta "Efectivo" tiene saldo 0
    Cuando registro un gasto de 20.000 con la cuenta "Efectivo"
    Entonces el saldo de "Efectivo" queda en -20.000
```

**Supuestos / preguntas abiertas**
- Si no se escribe descripción, se usa el nombre de la categoría en la PWA y "Transacción" en la API.
- Si no se elige fecha, se usa la fecha de hoy.
