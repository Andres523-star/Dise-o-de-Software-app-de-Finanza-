### HU-17: Semáforo de compra y venta de divisas

**Como** usuario
**Quiero** ver un semáforo (verde, amarillo o rojo) según la tasa de hoy frente a los últimos 90 días
**Para** decidir si es buen momento para comprar o vender dólares

**Validación INVEST**
- I — Independent: ✅ Usa sus propias consultas de tasas.
- N — Negotiable: ✅ Los cortes del semáforo se pueden ajustar.
- V — Valuable: ✅ Ayuda a decidir con datos.
- E — Estimable: ✅ Regla definida con percentiles.
- S — Small: ⚠️ 5 puntos.
- T — Testable: ✅ Con tasas conocidas el color es predecible.

**Criterios de aceptación (Gherkin)**
```gherkin
# language: es
Característica: Semáforo de divisas

  Escenario: Buen momento para comprar dólares
    Dado que la tasa de hoy está por debajo del percentil 25 de los últimos 90 días
    Cuando abro el Analista Financiero en modo "comprar"
    Entonces el semáforo se muestra en verde

  Escenario: Momento normal
    Dado que la tasa de hoy está entre el percentil 25 y el 75
    Cuando abro el Analista Financiero
    Entonces el semáforo se muestra en amarillo

  Escenario: Mal momento para comprar
    Dado que la tasa de hoy está por encima del percentil 75
    Cuando abro el Analista Financiero en modo "comprar"
    Entonces el semáforo se muestra en rojo

  Escenario: Sin internet
    Dado que no hay conexión
    Cuando abro el Analista Financiero
    Entonces se usa la última tasa guardada
    Y se muestra un aviso de que los datos pueden no estar actualizados
```

**Supuestos / preguntas abiertas**
- Implementado en la PWA (recommendations.js, recoSemaforo); no hace parte de la API Java.
- En modo "vender" los colores se invierten.
