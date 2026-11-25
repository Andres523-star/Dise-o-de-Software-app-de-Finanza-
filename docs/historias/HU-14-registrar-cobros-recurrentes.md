### HU-14: Registrar cobros recurrentes

**Como** usuario
**Quiero** registrar suscripciones y salarios que se repiten (semanal, quincenal, mensual o anual)
**Para** no tener que anotarlos cada vez

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ Las frecuencias se pueden ampliar.
- V — Valuable: ✅ Ahorra trabajo repetido.
- E — Estimable: ✅ Datos y cálculo de fecha definidos.
- S — Small: ⚠️ 5 puntos; cabe en un sprint pero es de las más grandes.
- T — Testable: ✅ La transacción generada y la próxima fecha son verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Cobros recurrentes

  Escenario: Registrar una suscripción
    Cuando registro "Netflix" por 44.900, frecuencia "MENSUAL", con la cuenta "Nu" y la categoría "Entretenimiento"
    Entonces el cobro aparece en la lista con su próxima fecha

  Esquema del escenario: Calcular la próxima fecha
    Dado un cobro con frecuencia "<frecuencia>" y próxima fecha 2026-11-15
    Cuando se registra el cobro de este periodo
    Entonces la próxima fecha pasa a <siguiente>

    Ejemplos:
      | frecuencia | siguiente  |
      | SEMANAL    | 2026-11-22 |
      | QUINCENAL  | 2026-11-30 |
      | MENSUAL    | 2026-12-15 |
      | ANUAL      | 2027-11-15 |

  Escenario: Generar el movimiento del cobro
    Dado el cobro "Netflix" de 44.900 que no es ingreso
    Cuando genero el cobro del periodo
    Entonces se registra un gasto de 44.900 en la cuenta "Nu"

  Escenario: Cobro con categoría que no corresponde
    Cuando registro un cobro de gasto con la categoría "Salario"
    Entonces el sistema responde que la categoría "Salario" es de tipo INGRESO y el cobro es EGRESO
```

**Supuestos / preguntas abiertas**
- En la API el cobro del periodo se genera a pedido (POST /api/cobros/{id}/generar); en la PWA se registra al llegar la fecha.
