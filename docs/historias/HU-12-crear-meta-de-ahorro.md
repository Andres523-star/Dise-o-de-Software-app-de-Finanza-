### HU-12: Crear una meta de ahorro

**Como** usuario
**Quiero** crear una meta con nombre, monto objetivo y fecha límite
**Para** ahorrar con un propósito (un viaje, una moto)

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ No impone cómo se muestra el progreso.
- V — Valuable: ✅ Motiva a ahorrar.
- E — Estimable: ✅ Datos claros.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ Porcentaje y faltante verificables.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Metas de ahorro

  Escenario: Crear una meta
    Cuando creo la meta "Viaje a Cartagena" por 2.000.000
    Entonces la meta aparece con 0 % de progreso
    Y faltan 2.000.000

  Escenario: Ver el progreso
    Dado que la meta "Viaje a Cartagena" tiene 500.000 ahorrados de 2.000.000
    Cuando consulto mis metas
    Entonces la meta muestra 25 % de progreso
    Y faltan 1.500.000

  Escenario: Meta sin monto objetivo
    Cuando intento crear una meta sin monto objetivo
    Entonces el sistema responde "El monto objetivo es obligatorio"
```

**Supuestos / preguntas abiertas**
- La celebración al completar la meta es parte de la interfaz; la API envía la notificación "🎉 ¡Meta cumplida!".
