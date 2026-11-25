### HU-10: Crear presupuesto mensual por categoría

**Como** usuario
**Quiero** ponerle un límite mensual a una categoría de gasto
**Para** controlar cuánto gasto en ella

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ No define cómo se dibuja la barra.
- V — Valuable: ✅ Ayuda a no gastar de más.
- E — Estimable: ✅ Datos claros: categoría, mes, año y límite.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ El porcentaje se calcula y se verifica.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Presupuesto mensual

  Escenario: Ver el porcentaje consumido
    Dado que este mes gasté 153.000 en "Comida"
    Cuando creo un presupuesto de 400.000 para "Comida"
    Entonces el presupuesto muestra 38.3 % consumido
    Y 247.000 disponibles
    Y el estado "NORMAL"

  Escenario: Cada mes empieza de cero
    Dado que tengo un presupuesto de "Comida" en noviembre
    Cuando consulto los presupuestos de diciembre
    Entonces el gasto de noviembre no cuenta en diciembre

  Escenario: Presupuesto repetido
    Dado que ya existe el presupuesto de "Comida" para 11/2026
    Cuando intento crear otro para "Comida" en 11/2026
    Entonces el sistema responde que ya existe un presupuesto para Comida en 11/2026

  Escenario: Presupuesto a una categoría de ingreso
    Cuando intento poner un presupuesto a "Salario"
    Entonces el sistema responde "Solo se pueden poner presupuestos a categorías de gasto"
```

**Supuestos / preguntas abiertas**
- El estado pasa a "ADVERTENCIA" desde el 80 % y a "LIMITE_ALCANZADO" desde el 100 %.
