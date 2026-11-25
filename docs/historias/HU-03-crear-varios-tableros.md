### HU-03: Crear varios tableros

**Como** usuario
**Quiero** crear tableros separados (por ejemplo Personal y Negocio)
**Para** no mezclar mis finanzas personales con las de mi negocio

**Validación INVEST**
- I — Independent: ✅ Se puede entregar sola; cada tablero arranca vacío.
- N — Negotiable: ✅ No dice cómo se guardan los tableros, solo qué puede hacer el usuario.
- V — Valuable: ✅ Permite llevar cuentas separadas sin otra app.
- E — Estimable: ✅ Operaciones claras: crear, renombrar y eliminar.
- S — Small: ✅ Cabe en un sprint.
- T — Testable: ✅ Cada operación tiene un resultado verificable.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Gestión de tableros

  Escenario: Crear un tablero nuevo
    Dado que soy el usuario "usr-andres"
    Cuando creo un tablero llamado "Mi tienda" de tipo "NEGOCIO"
    Entonces el tablero aparece en mi lista de tableros
    Y yo quedo como su "PROPIETARIO"
    Y su balance inicial es 0

  Escenario: Cada tablero tiene sus propios datos
    Dado que tengo los tableros "Mis finanzas" y "Mi tienda"
    Cuando registro un gasto en "Mi tienda"
    Entonces el gasto no aparece en "Mis finanzas"

  Escenario: Renombrar un tablero
    Dado que tengo el tablero "Mi tienda"
    Cuando le cambio el nombre a "Tienda de ropa"
    Entonces el tablero se muestra como "Tienda de ropa"

  Escenario: Eliminar un tablero
    Dado que tengo el tablero "Tienda de ropa" con transacciones
    Cuando lo elimino y confirmo dos veces
    Entonces el tablero desaparece de mi lista
    Y se borran sus cuentas, categorías, transacciones y presupuestos

  Escenario: Crear un tablero sin nombre
    Cuando intento crear un tablero sin nombre
    Entonces el sistema responde "El nombre del tablero es obligatorio"
```

**Supuestos / preguntas abiertas**
- Reordenar tableros (arrastrar) existe en la PWA, pero no se incluye en la API Java.
