### HU-11: Alertas al 80 %, 90 % y 100 % del presupuesto

**Como** usuario
**Quiero** recibir una alerta cuando llego al 80 %, al 90 % y al 100 % de un presupuesto
**Para** frenar el gasto a tiempo

**Validación INVEST**
- I — Independent: ⚠️ Depende de que exista el presupuesto (HU-10).
- N — Negotiable: ✅ El medio (aviso en la app o push) se puede conversar.
- V — Valuable: ✅ Avisa antes de que sea tarde.
- E — Estimable: ✅ Umbrales y regla de "una sola vez" definidos.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ Se verifica la lista de notificaciones.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Alertas de presupuesto

  Escenario: Alerta al pasar el 80 %
    Dado que tengo un presupuesto de 400.000 para "Comida" y llevo 153.000
    Cuando registro un gasto de 200.000 en "Comida"
    Entonces el presupuesto queda en 88.3 %
    Y recibo la notificación "⚠️ Presupuesto al 80%"

  Escenario: La alerta no se repite
    Dado que ya recibí la alerta del 80 % de "Comida" este mes
    Cuando registro otro gasto pequeño en "Comida" sin llegar al 90 %
    Entonces no recibo otra alerta del 80 %

  Escenario: Límite alcanzado
    Dado que llevo 88.3 % del presupuesto de "Comida"
    Cuando registro un gasto que lo lleva por encima del 100 %
    Entonces recibo las alertas pendientes del 90 % y la de "🚨 Límite alcanzado"
```

**Supuestos / preguntas abiertas**
- La historia original pedía 80 % y 100 %; la app también avisa al 90 % (balance.js), por eso se incluye.
