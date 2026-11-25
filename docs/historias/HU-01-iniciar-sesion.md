### HU-01: Iniciar sesión con Google, Apple o correo

**Como** usuario nuevo
**Quiero** registrarme e iniciar sesión con Google, Apple o correo y contraseña
**Para** entrar rápido a la app y tener mis datos financieros protegidos

**Validación INVEST**
- I — Independent: ✅ Se puede entregar sin depender de otras historias; es la puerta de entrada.
- N — Negotiable: ✅ No impone cómo se autentica internamente; solo los métodos que el usuario puede elegir.
- V — Valuable: ✅ Sin cuenta el usuario no puede guardar ni proteger sus datos.
- E — Estimable: ✅ Los tres métodos y los mensajes de error están definidos.
- S — Small: ✅ Cabe en un sprint (los proveedores de identidad ya existen).
- T — Testable: ✅ Se verifica entrando, fallando la contraseña y cerrando sesión.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Inicio de sesión

  Escenario: Registro con Google
    Dado que no tengo cuenta en Mis Finanzas
    Cuando elijo "Entrar con Google" y acepto con mi cuenta de Google
    Entonces se crea mi cuenta
    Y entro a la pantalla principal con mi tablero "My finances"

  Escenario: Contraseña incorrecta
    Dado que tengo una cuenta con el correo "andres@ejemplo.com"
    Cuando intento entrar con una contraseña incorrecta
    Entonces la app muestra un mensaje de error claro
    Y sigo en la pantalla de inicio de sesión

  Escenario: Cerrar sesión
    Dado que inicié sesión
    Cuando cierro sesión
    Entonces vuelvo a la pantalla de inicio
    Y no queda ningún dato financiero visible
```

**Supuestos / preguntas abiertas**
- El ingreso con Apple requiere una cuenta de Apple Developer de pago; en la versión actual está programado pero no habilitado en Firebase.
- No se especifica el texto exacto del mensaje de error; se usa el que devuelve Firebase Auth.
