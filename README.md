# 💰 Mis Finanzas

Aplicación web progresiva (**PWA**) para gestionar las finanzas personales y de negocio desde el celular o el computador, incluso sin conexión a internet.

🔗 **App en vivo:** https://mis-finanzas-app-2d508.web.app

## 📲 Cómo instalarla
1. Abre el enlace en el celular (Chrome en Android o Safari en iPhone).
2. **Android:** menú ⋮ → *Instalar app* / *Agregar a pantalla de inicio*.
3. **iPhone:** botón *Compartir* → *Agregar a pantalla de inicio*.
4. Inicia sesión con Google, Apple o correo.

## ✨ Funcionalidades
- Ingresos, egresos y ahorros en varias cuentas (Efectivo, Nequi, Nu).
- Presupuestos mensuales por categoría con alertas al 80 %, 90 % y 100 %.
- Metas de ahorro con abonos y "tomar de balance".
- Cobros recurrentes (suscripciones y salarios) con notificaciones push.
- Analista Financiero: semáforo de compra/venta de dólares (TRM de los últimos 90 días).
- Multi-tableros (personal / negocio) y colaboración en tiempo real.
- Onboarding con test de personalidad financiera, multimoneda e idiomas.
- Funciona offline gracias al Service Worker.

## 🛠️ Tecnologías
- **Frontend:** HTML5, CSS3, JavaScript Vanilla, Service Worker.
- **Backend de la PWA:** Firebase (Authentication, Firestore, Cloud Functions, Cloud Messaging, Hosting).
- **Implementación representativa en Java:** Spring Boot 3.5 + MongoDB en [`misfinanzas-api/`](misfinanzas-api), con las capas del diseño (Controller → Service → Repository).

## ☕ Implementación representativa en Java
La carpeta [`misfinanzas-api/`](misfinanzas-api) contiene una API REST en **Java + Spring Boot + MongoDB** que implementa
las clases del diagrama de clases (Tablero, Cuenta, Categoría, Transacción → Ingreso/Egreso/Ahorro, Presupuesto,
MetaAhorro, CobroRecurrente) y las capas del diagrama de componentes. Incluye pruebas JUnit, Swagger y una
colección de Postman. Instrucciones en su [README](misfinanzas-api/README.md).

## 📁 Estructura
```
index.html, app.js, style.css   → entrada de la PWA
frontend/                        → pantallas y lógica de interfaz
backend/                         → autenticación, tableros, notificaciones, Firebase
sw.js                            → Service Worker (offline)
functions/                       → Cloud Functions (recordatorios de cobros)
misfinanzas-api/                 → implementación en Java (Spring Boot + MongoDB)
docs/historias/                  → historias de usuario (INVEST + Gherkin), una por archivo
docs/trazabilidad.md             → matriz requisitos → diseño → código → pruebas
docs/diagramas/                  → diagramas UML (.vpd y PNG)
```

## 📐 Documentación
- **Historias de usuario:** [`docs/historias/00-resumen.md`](docs/historias/00-resumen.md) (también en los Issues con la etiqueta *Historia de Usuario*).
- **Trazabilidad y patrones de diseño:** [`docs/trazabilidad.md`](docs/trazabilidad.md).
- **Diagramas:** [`docs/diagramas/`](docs/diagramas) y los Issues con la etiqueta *Diagrama* (Diagrama 1 a 5).
- **Información general:** Issue con la etiqueta *Información General*.

---
Proyecto de la materia **Diseño de Software**.
