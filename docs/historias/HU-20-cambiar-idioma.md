### HU-20: Cambiar el idioma

**Como** usuario
**Quiero** cambiar el idioma de la app
**Para** usarla en el idioma que prefiera

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ La lista de idiomas se puede ampliar.
- V — Valuable: ✅ Amplía quién puede usar la app.
- E — Estimable: ✅ Alcance claro.
- S — Small: ✅ 2 puntos.
- T — Testable: ✅ Los textos cambian de forma visible.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Idioma

  Escenario: Cambiar a inglés
    Dado que la app está en español
    Cuando elijo "English" en la configuración
    Entonces todos los textos se muestran en inglés sin recargar la página

  Escenario: Buscar un idioma
    Cuando escribo "esp" en el buscador de idiomas
    Entonces aparece "Español" en la lista

  Escenario: El idioma se recuerda
    Dado que elegí inglés
    Cuando vuelvo a abrir la app
    Entonces la app sigue en inglés
```

**Supuestos / preguntas abiertas**
- Implementado en la PWA (i18n.js); no aplica a la API Java.
