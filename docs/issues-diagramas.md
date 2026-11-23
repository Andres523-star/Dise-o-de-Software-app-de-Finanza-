# Issues de diagramas — copiar y pegar en GitHub

Para cada uno: GitHub → pestaña **Issues** → **New issue** → pega el **Título** y la **Descripción** → arrastra la imagen PNG del diagrama dentro de la descripción → etiqueta `diagrama` → **Submit new issue**.
Créalos en orden (1 → 5) para que queden numerados en secuencia.

---

## Título: Diagrama 1 – Vista de Contexto – Mis Finanzas

**Descripción:**
Muestra el sistema *Mis Finanzas (PWA)* en el centro y los actores/sistemas externos con los que intercambia información:
- **Usuario** (propietario / colaborador): envía registro, transacciones, presupuestos, metas e invitaciones; recibe balances, alertas (80% / 100%) y el semáforo de divisas.
- **Pasarela de Pagos (Stripe):** solicitud de cobro de la suscripción premium y su confirmación.
- **API de Divisas (TRM):** consulta y respuesta de la tasa de cambio en vivo.
- **Servidor de Notificaciones Push (Firebase FCM):** envío de alertas push y estado de entrega.

📎 Imagen: *(arrastrar aquí Diagrama 1 – Vista de Contexto.png)*

---

## Título: Diagrama 2 – Vista Funcional – Mis Finanzas

**Descripción:**
Diagrama de componentes organizado en **3 capas**:
- **Presentación (Controllers):** TransaccionController, PresupuestoController, NotificacionController, DivisasController.
- **Negocio (Services):** GestorTransacciones, GestorPresupuestos, Notificador, AnalistaDivisas. Cada uno expone su interfaz (IGestorTransacciones, IGestorPresupuestos, INotificador, IAnalistaDivisas) para mantener **bajo acoplamiento**.
- **Datos (Repositories):** Transaccion, Cuenta, Tablero y Presupuesto Repository, que persisten en **MongoDB**.
- **Adaptadores externos:** FcmAdapter (push) y TrmApiAdapter (divisas).

Flujo: Controller → Service → Repository → MongoDB.

📎 Imagen: *(arrastrar aquí Diagrama 2 – Vista Funcional.png)*

---

## Título: Diagrama 3 – Vista Lógica – Mis Finanzas

**Descripción:**
Diagrama de clases del dominio:
- **Usuario** es propietario de tableros y miembro de otros a través de la clase asociación **Membresia** (rol, fecha de ingreso).
- **Tablero** se compone (composición ◆) de Cuenta, Categoria, Transaccion, Presupuesto, MetaAhorro y CobroRecurrente.
- **Transaccion** es abstracta; heredan **Ingreso**, **Egreso** y **Ahorro**.
- **MetaAhorro** se compone de **Abonos**, que salen de una Cuenta de origen.
- **CobroRecurrente** crea transacciones automáticamente.
- Enumeraciones: TipoCuenta, TipoTablero, RolTablero, Frecuencia.

📎 Imagen: *(arrastrar aquí Diagrama 3 – Vista Lógica.png)*

---

## Título: Diagrama 4 – Vista de Desarrollo – Mis Finanzas

**Descripción:**
Organización real del código en módulos y paquetes:
- **frontend/** (presentación): state.js, transactions.js, balance.js, budgets.js, categories.js, helpers.js, currency.js, recommendations.js, features.js, onboarding.js, i18n.js.
- **backend/** (servicios y acceso a datos): auth.js, boards.js, notifications.js, firebase-config.js, sw-register.js.
- **Service Worker:** sw.js (funcionamiento offline).
- **functions/:** index.js (Cloud Function de recordatorios de cobros recurrentes).
- Dependencias externas: Firebase SDK y open.er-api.com (tasas de cambio).

📎 Imagen: *(arrastrar aquí Diagrama 4 – Vista de Desarrollo.png)*

---

## Título: Diagrama 5 – Vista de Despliegue – Mis Finanzas

**Descripción:**
Nodos físicos donde corre el sistema:
- **Dispositivo del Usuario (iOS / Android)** con el **Navegador** donde está instalada la PWA (Mis Finanzas PWA, sw.js, manifest.json, IndexedDB / Cache Storage).
- **Servidor Web (Firebase Hosting):** entrega los archivos estáticos por HTTPS:443.
- **Servidor Backend (Node.js):** mis-finanzas-api (Controllers, Services, Repositories), vía REST / WebSocket por HTTPS:443.
- **Servidor de Base de Datos:** MongoDB (TCP:27017).
- **Sistemas externos:** API de Divisas (TRM), Pasarela de Pagos (Stripe), Firebase Cloud Messaging (Web Push al dispositivo).

📎 Imagen: *(arrastrar aquí Diagrama 5 – Vista de Despliegue.png)*
