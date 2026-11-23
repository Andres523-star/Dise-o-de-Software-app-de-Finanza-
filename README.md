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
- Presupuestos mensuales por categoría con alertas al 80% y 100%.
- Metas de ahorro con abonos y "tomar de balance".
- Cobros recurrentes (suscripciones y salarios) con notificaciones push.
- Analista Financiero: semáforo de compra/venta de dólares (TRM de los últimos 90 días).
- Multi-tableros (personal / negocio) y colaboración en tiempo real.
- Onboarding con test de personalidad financiera, multimoneda e idiomas.
- Funciona offline gracias al Service Worker.

## 🛠️ Tecnologías
- **Frontend:** HTML5, CSS3, JavaScript Vanilla, Service Worker.
- **Backend actual:** Firebase (Authentication, Firestore, Cloud Functions, Cloud Messaging, Hosting).
- **Diseño de arquitectura:** 3 capas (Controller → Service → Repository) con persistencia documental en MongoDB.

## 📁 Estructura
```
index.html, app.js, style.css   → entrada de la app
frontend/                        → pantallas y lógica de interfaz
backend/                         → autenticación, tableros, notificaciones, Firebase
sw.js                            → Service Worker (offline)
functions/                       → Cloud Functions (recordatorios de cobros)
docs/                            → historias de usuario y descripción de diagramas
```

## 📐 Documentación
- **Historias de usuario:** Issues con la etiqueta *Historia de Usuario* (HU-01 a HU-16).
- **Diagramas:** Issues con la etiqueta *Diagrama* (Diagrama 1 a 5).
- **Información general:** Issue con la etiqueta *Información General*.

---
Proyecto de la materia **Diseño de Software**.
