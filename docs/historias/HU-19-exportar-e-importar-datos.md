### HU-19: Exportar e importar mis datos

**Como** usuario
**Quiero** exportar una copia de mis datos e importarla después
**Para** tener un respaldo o pasar mis datos a otro dispositivo

**Validación INVEST**
- I — Independent: ✅ Se entrega sola.
- N — Negotiable: ✅ El formato del archivo se puede conversar.
- V — Valuable: ✅ Da tranquilidad de no perder la información.
- E — Estimable: ✅ Alcance claro.
- S — Small: ✅ 3 puntos.
- T — Testable: ✅ Exportar e importar debe dejar los mismos datos.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Respaldo de datos

  Escenario: Exportar
    Dado que tengo transacciones, categorías y cuentas en mi tablero
    Cuando elijo "Exportar datos"
    Entonces se descarga un archivo con todos los datos del tablero

  Escenario: Importar
    Dado que tengo un archivo exportado de Mis Finanzas
    Cuando lo importo en otro dispositivo
    Entonces veo las mismas transacciones, categorías y cuentas

  Escenario: Archivo inválido
    Cuando intento importar un archivo que no es de Mis Finanzas
    Entonces la app muestra un mensaje de error
    Y mis datos actuales no cambian
```

**Supuestos / preguntas abiertas**
- Implementado en la PWA (state.js: exportAppData / importAppData); no aplica a la API Java.
