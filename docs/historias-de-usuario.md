# Historias de Usuario — Mis Finanzas

Formato: **Como** [rol] **quiero** [acción] **para** [beneficio].
Prioridad: Alta / Media / Baja · Estimación en puntos de historia (1, 2, 3, 5, 8).
Cada historia se crea como un *Issue* en GitHub con la etiqueta `historia-de-usuario`.

---

## Épica 1 · Autenticación y Onboarding

### HU-01 · Iniciar sesión con Google, Apple o correo
**Como** usuario nuevo **quiero** registrarme e iniciar sesión con Google, Apple o correo y contraseña **para** entrar rápido y tener mis datos protegidos.
**Criterios de aceptación**
- Dado que no tengo cuenta, cuando elijo Google/Apple/correo, entonces se crea mi cuenta y entro a la app.
- Si el correo o la contraseña son incorrectos, se muestra un mensaje de error claro.
- Al cerrar sesión, vuelvo a la pantalla de inicio y no quedan datos visibles.
**Prioridad:** Alta · **Puntos:** 5

### HU-02 · Test de personalidad financiera (onboarding)
**Como** usuario nuevo **quiero** responder un test corto sobre mis hábitos de dinero **para** recibir recomendaciones acordes a mi perfil.
**Criterios de aceptación**
- El test aparece solo la primera vez que entro.
- Al terminar, se guarda mi perfil financiero y lo veo en mi cuenta.
- Puedo saltar el test y hacerlo después.
**Prioridad:** Media · **Puntos:** 3

---

## Épica 2 · Tableros y colaboración

### HU-03 · Crear varios tableros
**Como** usuario **quiero** crear tableros separados (Personal, Negocio) **para** no mezclar mis finanzas personales con las del negocio.
**Criterios de aceptación**
- Puedo crear, renombrar, reordenar y eliminar tableros.
- Cada tablero tiene sus propias cuentas, categorías, transacciones y presupuestos.
- Eliminar un tablero pide confirmación.
**Prioridad:** Alta · **Puntos:** 5

### HU-04 · Invitar a otra persona a un tablero
**Como** propietario de un tablero **quiero** invitar a otra persona por correo **para** llevar las finanzas en conjunto (pareja, socio).
**Criterios de aceptación**
- El invitado recibe la invitación y puede aceptarla o rechazarla.
- Los cambios de cualquiera se ven en tiempo real en el dispositivo del otro.
- Solo el propietario puede eliminar el tablero.
**Prioridad:** Media · **Puntos:** 8

---

## Épica 3 · Cuentas y transacciones

### HU-05 · Registrar un gasto
**Como** usuario **quiero** registrar un gasto con monto, categoría, cuenta, fecha y descripción **para** saber en qué se va mi dinero.
**Criterios de aceptación**
- El gasto se descuenta del saldo de la cuenta elegida.
- El gasto aparece en el historial y en el resumen del mes.
- No se permite guardar sin monto ni categoría.
**Prioridad:** Alta · **Puntos:** 3

### HU-06 · Registrar un ingreso
**Como** usuario **quiero** registrar ingresos (salario, ventas) **para** ver cuánto dinero entra cada mes.
**Criterios de aceptación**
- El ingreso se suma al saldo de la cuenta elegida.
- Se refleja en el balance del mes.
**Prioridad:** Alta · **Puntos:** 2

### HU-07 · Manejar varias cuentas (Efectivo, Nequi, Nu)
**Como** usuario **quiero** tener varias cuentas con su propio saldo **para** saber cuánto tengo en cada una.
**Criterios de aceptación**
- Puedo crear cuentas con nombre, tipo y color.
- Cada cuenta muestra su saldo actualizado.
- El balance total suma todas las cuentas.
**Prioridad:** Alta · **Puntos:** 3

### HU-08 · Editar o eliminar una transacción
**Como** usuario **quiero** corregir o borrar una transacción **para** que mis saldos queden exactos si me equivoco.
**Criterios de aceptación**
- Al editar, el saldo de la cuenta se recalcula.
- Al eliminar, se pide confirmación y el saldo se ajusta.
**Prioridad:** Alta · **Puntos:** 2

### HU-09 · Personalizar categorías
**Como** usuario **quiero** crear y editar categorías con nombre, ícono y color **para** organizar mis gastos a mi manera.
**Criterios de aceptación**
- Puedo crear, renombrar, cambiar emoji/color y eliminar categorías.
- Puedo buscar una categoría por nombre.
**Prioridad:** Media · **Puntos:** 3

---

## Épica 4 · Presupuestos y alertas

### HU-10 · Crear presupuesto mensual por categoría
**Como** usuario **quiero** poner un límite mensual a una categoría **para** controlar cuánto gasto.
**Criterios de aceptación**
- Veo una barra con el porcentaje consumido del presupuesto.
- El presupuesto se reinicia cada mes.
**Prioridad:** Alta · **Puntos:** 3

### HU-11 · Alertas al 80% y 100% del presupuesto
**Como** usuario **quiero** recibir una alerta cuando llego al 80% y al 100% de un presupuesto **para** frenar el gasto a tiempo.
**Criterios de aceptación**
- Al llegar al 80% recibo un aviso de advertencia.
- Al llegar al 100% recibo un aviso de límite alcanzado.
- Cada alerta llega una sola vez por mes y categoría.
**Prioridad:** Alta · **Puntos:** 3

---

## Épica 5 · Metas de ahorro

### HU-12 · Crear una meta de ahorro
**Como** usuario **quiero** crear una meta con nombre, monto objetivo y fecha **para** ahorrar con un propósito (viaje, moto).
**Criterios de aceptación**
- Veo el progreso en porcentaje y el monto que falta.
- Al completar la meta se muestra una celebración.
**Prioridad:** Media · **Puntos:** 3

### HU-13 · Abonar a una meta o "tomar de balance"
**Como** usuario **quiero** hacer abonos a mi meta desde una cuenta, o tomar dinero del balance disponible del mes **para** avanzar en mi ahorro.
**Criterios de aceptación**
- El abono se descuenta de la cuenta de origen y se suma a la meta.
- "Tomar de balance" solo se permite si hay saldo disponible en el mes.
**Prioridad:** Media · **Puntos:** 3

---

## Épica 6 · Cobros recurrentes y notificaciones

### HU-14 · Registrar cobros recurrentes
**Como** usuario **quiero** registrar suscripciones y salarios que se repiten (semanal, quincenal, mensual, anual) **para** no tener que anotarlos cada vez.
**Criterios de aceptación**
- Defino nombre, monto, frecuencia, cuenta y si es ingreso o gasto.
- La app calcula la próxima fecha de cobro.
**Prioridad:** Media · **Puntos:** 5

### HU-15 · Recordatorio push de cobros
**Como** usuario **quiero** recibir una notificación push antes de un cobro recurrente **para** tener el dinero listo.
**Criterios de aceptación**
- Puedo activar o desactivar las notificaciones.
- La notificación llega aunque la app esté cerrada.
**Prioridad:** Media · **Puntos:** 5

---

## Épica 7 · Divisas y Analista Financiero

### HU-16 · Usar varias monedas
**Como** usuario **quiero** elegir una moneda principal y otras secundarias (COP, USD, EUR) **para** ver mis montos convertidos.
**Criterios de aceptación**
- Las tasas se actualizan desde una API externa.
- Los montos se muestran convertidos a la moneda elegida.
**Prioridad:** Media · **Puntos:** 5

### HU-17 · Semáforo de compra/venta de divisas
**Como** usuario **quiero** ver un semáforo (verde/amarillo/rojo) según la tasa actual frente a los últimos 90 días **para** decidir si es buen momento para comprar o vender dólares.
**Criterios de aceptación**
- Se muestra la tasa del día, la tendencia y el color del semáforo.
- Si no hay internet, se usa la última tasa guardada y se avisa.
**Prioridad:** Baja · **Puntos:** 5

---

## Épica 8 · Experiencia (PWA)

### HU-18 · Instalar la app y usarla sin internet
**Como** usuario **quiero** instalar Mis Finanzas en mi celular y registrar movimientos sin conexión **para** usarla en cualquier lugar.
**Criterios de aceptación**
- El navegador ofrece "Agregar a pantalla de inicio".
- Sin internet la app abre y guarda; al volver la conexión, se sincroniza.
**Prioridad:** Alta · **Puntos:** 5

### HU-19 · Exportar e importar mis datos
**Como** usuario **quiero** exportar una copia de mis datos e importarla **para** tener respaldo o pasar a otro dispositivo.
**Criterios de aceptación**
- Se descarga un archivo con todos los datos del tablero.
- Al importarlo, los datos se restauran correctamente.
**Prioridad:** Baja · **Puntos:** 3

### HU-20 · Cambiar idioma
**Como** usuario **quiero** cambiar el idioma de la app **para** usarla en el idioma que prefiera.
**Criterios de aceptación**
- Puedo buscar y elegir un idioma de la lista.
- Todos los textos cambian sin recargar.
**Prioridad:** Baja · **Puntos:** 2

### HU-21 · Ver balance y resumen del mes
**Como** usuario **quiero** ver en la pantalla principal mi balance, ingresos, gastos y ahorro del mes **para** entender mi situación de un vistazo.
**Criterios de aceptación**
- El resumen se actualiza al registrar cualquier movimiento.
- Puedo filtrar el balance por cuenta.
**Prioridad:** Alta · **Puntos:** 3
