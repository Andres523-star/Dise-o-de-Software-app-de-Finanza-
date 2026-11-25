### HU-04: Invitar a otra persona a un tablero

**Como** propietario de un tablero
**Quiero** invitar a otra persona por su correo
**Para** llevar las finanzas en conjunto con mi pareja o socio

**Validación INVEST**
- I — Independent: ⚠️ Necesita que exista el tablero (HU-03); por lo demás se entrega sola.
- N — Negotiable: ✅ No impone el medio de la invitación.
- V — Valuable: ✅ Permite manejar dinero compartido en un solo lugar.
- E — Estimable: ✅ Reglas claras: correo registrado, rol y no repetir miembros.
- S — Small: ⚠️ Con la sincronización en tiempo real es grande (8 puntos); se puede dividir en "invitar" y "ver cambios en tiempo real".
- T — Testable: ✅ Se verifica la lista de miembros y los errores.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Compartir un tablero

  Escenario: Invitar a una persona registrada
    Dado que soy propietario del tablero "Mis finanzas"
    Y "laura@ejemplo.com" es un usuario registrado
    Cuando invito a "laura@ejemplo.com" con el rol "EDITOR"
    Entonces Laura aparece como miembro del tablero con el rol "EDITOR"
    Y el tablero aparece en la lista de tableros de Laura

  Escenario: Invitar a alguien que ya es miembro
    Dado que Laura ya es miembro del tablero "Mis finanzas"
    Cuando la invito otra vez
    Entonces el sistema responde "Esa persona ya es miembro del tablero"

  Escenario: Invitar un correo que no está registrado
    Cuando invito a "noexiste@ejemplo.com"
    Entonces el sistema responde "No se encontró Usuario con correo: noexiste@ejemplo.com"

  Escenario: No se puede invitar a otro propietario
    Cuando invito a Laura con el rol "PROPIETARIO"
    Entonces el sistema responde "Un tablero solo puede tener un propietario"

  Escenario: Ver cambios en tiempo real
    Dado que Laura y yo tenemos abierto el tablero "Mis finanzas"
    Cuando Laura registra un gasto
    Entonces el gasto aparece en mi pantalla sin recargar
```

**Supuestos / preguntas abiertas**
- En la PWA, si el correo aún no está registrado, la invitación queda pendiente hasta que esa persona inicie sesión; la API Java exige que el usuario ya exista.
- El tiempo real lo da Firestore (onSnapshot) en la PWA; la API Java no lo implementa.
