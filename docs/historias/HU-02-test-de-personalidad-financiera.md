### HU-02: Test de personalidad financiera (onboarding)

**Como** usuario nuevo
**Quiero** responder un test corto sobre mis hábitos con el dinero
**Para** recibir recomendaciones acordes a mi perfil financiero

**Validación INVEST**
- I — Independent: ✅ Solo necesita que el usuario exista; no depende de otras funcionalidades.
- N — Negotiable: ✅ El número y el tipo de preguntas se pueden conversar con el equipo.
- V — Valuable: ✅ Personaliza la experiencia desde el primer uso.
- E — Estimable: ✅ Alcance claro: mostrar el test, guardar el perfil y permitir saltarlo.
- S — Small: ✅ Cabe en un sprint.
- T — Testable: ✅ Se verifica que aparece una sola vez y que el perfil queda guardado.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Test de personalidad financiera

  Escenario: El test aparece la primera vez
    Dado que acabo de crear mi cuenta
    Cuando entro a la app por primera vez
    Entonces se muestra el test de personalidad financiera

  Escenario: Guardar el perfil al terminar
    Dado que estoy respondiendo el test
    Cuando respondo todas las preguntas
    Entonces se guarda mi perfil financiero
    Y lo puedo ver en la información de mi cuenta

  Escenario: Saltar el test
    Dado que se muestra el test
    Cuando elijo "Saltar"
    Entonces entro a la pantalla principal
    Y puedo hacer el test más tarde desde la configuración

  Escenario: El test no se repite
    Dado que ya completé o salté el test
    Cuando vuelvo a entrar a la app
    Entonces no se muestra el test de nuevo
```

**Supuestos / preguntas abiertas**
- No se definió cuántas preguntas tiene el test ni los nombres de los perfiles; se deja abierto.
