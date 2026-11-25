### HU-06: Registrar un ingreso

**Como** usuario
**Quiero** registrar mis ingresos (salario, ventas)
**Para** ver cuánto dinero me entra cada mes

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ No impone diseño ni tecnología.
- V — Valuable: ✅ Sin ingresos no hay balance real.
- E — Estimable: ✅ Igual de clara que el gasto.
- S — Small: ✅ 2 puntos.
- T — Testable: ✅ El saldo y el resumen del mes son verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Registrar un ingreso

  Escenario: Ingreso válido
    Dado que la cuenta "Nequi" tiene un saldo de 288.000
    Cuando registro un ingreso de 400.000 en la categoría "Salario" con la cuenta "Nequi"
    Entonces el ingreso queda guardado con tipo "INGRESO"
    Y el saldo de "Nequi" queda en 688.000

  Escenario: El ingreso se refleja en el resumen del mes
    Dado que este mes tengo ingresos por 3.400.000
    Cuando registro un ingreso de 100.000
    Entonces el resumen del mes muestra ingresos por 3.500.000

  Escenario: Ingreso con monto cero
    Cuando intento registrar un ingreso de 0
    Entonces el sistema responde "El monto debe ser mayor a cero"
```

**Supuestos / preguntas abiertas**
- Ninguno.
