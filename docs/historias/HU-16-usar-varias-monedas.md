### HU-16: Usar varias monedas

**Como** usuario
**Quiero** elegir una moneda principal y otras secundarias (COP, USD, EUR)
**Para** ver mis montos convertidos

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ El proveedor de tasas se puede cambiar.
- V — Valuable: ✅ Útil para quien recibe o gasta en dólares.
- E — Estimable: ✅ Usa una API pública de tasas.
- S — Small: ⚠️ 5 puntos.
- T — Testable: ✅ La conversión es un cálculo verificable.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Divisas

  Escenario: Consultar las tasas del día
    Cuando consulto las tasas con base "USD"
    Entonces recibo la tasa de "COP" y de las demás monedas

  Escenario: Convertir un monto
    Dado que la tasa de USD a COP es T
    Cuando convierto 100 USD a COP
    Entonces el resultado es 100 × T, redondeado a dos decimales

  Escenario: Moneda que no existe
    Cuando consulto las tasas con base "XXX"
    Entonces el sistema responde que la moneda 'XXX' no es soportada por la API de divisas

  Escenario: Sin conexión con la API
    Dado que ya consulté las tasas de "COP" antes
    Cuando la API de divisas no responde
    Entonces se usan las últimas tasas guardadas
```

**Supuestos / preguntas abiertas**
- La PWA actualiza las tasas cada 12 horas (currency.js); la API Java las consulta en cada petición y guarda la última respuesta.
