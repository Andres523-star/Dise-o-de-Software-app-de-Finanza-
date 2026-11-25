### HU-09: Personalizar categorías

**Como** usuario
**Quiero** crear y editar categorías con nombre, ícono y color
**Para** organizar mis movimientos a mi manera

**Validación INVEST**
- I — Independent: ✅ Se entrega sola (hay categorías por defecto).
- N — Negotiable: ✅ El catálogo de íconos se puede conversar.
- V — Valuable: ✅ Cada persona clasifica distinto.
- E — Estimable: ✅ Operaciones claras.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ Resultados verificables en la lista.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Categorías

  Escenario: Crear una categoría
    Cuando creo la categoría "Mascotas" con el ícono "🐶" de tipo "EGRESO"
    Entonces la categoría aparece en la lista del tablero

  Escenario: Crear una categoría sin ícono
    Cuando creo la categoría "Varios" sin ícono
    Entonces la categoría se guarda con el ícono "📌"

  Escenario: Buscar por nombre
    Dado que existen las categorías "Comida", "Transporte" y "Entretenimiento"
    Cuando busco "com"
    Entonces solo aparece "Comida"

  Escenario: Editar el color
    Cuando cambio el color de "Comida" a "#FF9500"
    Entonces "Comida" se muestra con el color "#FF9500"

  Escenario: No borrar una categoría con movimientos
    Dado que "Comida" tiene gastos registrados
    Cuando intento eliminar "Comida"
    Entonces el sistema responde "No se puede eliminar la categoría porque tiene transacciones registradas"
```

**Supuestos / preguntas abiertas**
- En la PWA, al borrar una categoría con movimientos se pide confirmación; la API Java la bloquea para no dejar transacciones huérfanas.
