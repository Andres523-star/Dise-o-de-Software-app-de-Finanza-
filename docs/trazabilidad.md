# Matriz de trazabilidad: requisitos → diseño → código → pruebas

Cómo se conecta cada historia de usuario con los diagramas, el código Java (`misfinanzas-api/`),
los endpoints que se prueban en Postman y las pruebas automáticas (JUnit).

| Historia | Diagrama 3 (clases) | Diagrama 2 (componentes) | Código Java | Endpoint | Prueba |
|---|---|---|---|---|---|
| HU-03 Crear tableros | `Tablero` | TableroRepository | `GestorTableros.crear / renombrar / eliminar` | `POST/PATCH/DELETE /api/tableros` | Postman 2.x |
| HU-04 Invitar | `Tablero.invitar()`, `Membresia`, `RolTablero` | — | `GestorTableros.invitar` | `POST /api/tableros/{id}/miembros` | `MetaYCobroTest.invitarAgregaUnMiembroUnaSolaVez` |
| HU-05 Registrar gasto | `Transaccion` → `Egreso.aplicar()` | TransaccionController → IGestorTransacciones → ITransaccionRepository | `GestorTransacciones.registrar`, `TransaccionFactory` | `POST /api/tableros/{id}/transacciones` | `TransaccionTest.egresoRestaDelSaldoYPuedeQuedarNegativo` |
| HU-06 Registrar ingreso | `Ingreso.aplicar()` | igual que HU-05 | `GestorTransacciones.registrar` | `POST /api/tableros/{id}/transacciones` | `TransaccionTest.ingresoSumaAlSaldo` |
| HU-07 Varias cuentas | `Cuenta.actualizarSaldo()`, `Tablero.calcularBalance()` | ICuentaRepository | `GestorCuentas` | `GET/POST /api/tableros/{id}/cuentas` | `MetaYCobroTest.elBalanceDelTableroSumaTodasLasCuentas` |
| HU-08 Editar/eliminar | `Transaccion.revertir()` | IGestorTransacciones | `GestorTransacciones.editar / eliminar` | `PUT/DELETE /api/transacciones/{id}` | `TransaccionTest.revertirDejaElSaldoComoEstaba` |
| HU-09 Categorías | `Categoria` | — | `GestorCategorias` | `GET/POST /api/tableros/{id}/categorias`, `PATCH/DELETE /api/categorias/{id}` | Postman 4.x |
| HU-10 Presupuesto | `Presupuesto.porcentajeConsumido()` | PresupuestoController → IGestorPresupuestos → IPresupuestoRepository | `GestorPresupuestos.crear` | `POST/GET /api/tableros/{id}/presupuestos` | `PresupuestoTest.calculaElPorcentajeConsumido` |
| HU-11 Alertas 80/90/100 | `Presupuesto.evaluarUmbral()` | GestorTransacciones ..> IGestorPresupuestos ..> INotificador | `GestorPresupuestos.verificarUmbral`, `Notificador` | `GET /api/tableros/{id}/notificaciones` | `PresupuestoTest.alertaAl80PorCiento`, `cadaAlertaSaleUnaSolaVez` |
| HU-12 Meta de ahorro | `MetaAhorro` | — | `GestorMetas.crear` | `POST/GET /api/tableros/{id}/metas` | `MetaYCobroTest.laMetaSeCompletaAlLlegarAlObjetivo` |
| HU-13 Abonar | `MetaAhorro.abonar()`, `Abono` | — | `GestorMetas.abonar` | `POST /api/metas/{id}/abonos` | `MetaYCobroTest.abonarPasaDineroDeLaCuentaALaMeta` |
| HU-14 Cobros recurrentes | `CobroRecurrente.generarTransaccion()` «crea», `Frecuencia` | — | `GestorCobros` | `POST/GET /api/tableros/{id}/cobros`, `POST /api/cobros/{id}/generar` | `MetaYCobroTest.elCobroGeneraUnEgresoYMueveLaFecha` |
| HU-15 Recordatorio push | — | Notificador → IServicioPush → FcmAdapter | `Notificador`, `FcmAdapter` | `GET /api/tableros/{id}/notificaciones` | Postman 9.x |
| HU-16 Varias monedas | — | DivisasController → IAnalistaDivisas → IProveedorDivisas → TrmApiAdapter | `AnalistaDivisas`, `TrmApiAdapter` | `GET /api/divisas/{base}`, `/api/divisas/convertir` | Postman 1.x |
| HU-21 Resumen del mes | `Tablero.calcularBalance()` | — | `GestorTableros.resumen` | `GET /api/tableros/{id}/resumen` | Postman 2.3 |

Las historias HU-01, HU-02, HU-17, HU-18, HU-19 y HU-20 se implementan en la PWA (Firebase); no hacen
parte de la implementación representativa en Java.

## Patrones de diseño en el código Java

| Patrón | Dónde | Para qué |
|---|---|---|
| **Controlador** (GRASP) | `controller/*Controller` | Reciben la petición HTTP y delegan al gestor; no tienen lógica de negocio |
| **Experto en Información** (GRASP) | `Presupuesto.porcentajeConsumido()`, `Tablero.calcularBalance()`, `Cuenta.verificarFondos()` | Cada clase calcula con sus propios datos |
| **Creador** (GRASP) | `CobroRecurrente.generarTransaccion()` | El cobro tiene los datos para crear la transacción |
| **Polimorfismo** (GRASP) | `Transaccion.aplicar()` en `Ingreso`, `Egreso`, `Ahorro` | El gestor no pregunta el tipo; cada subclase sabe qué hacer |
| **Bajo Acoplamiento / Inversión de Dependencias** | Los gestores dependen de interfaces `IGestor…`, `IProveedorDivisas`, `IServicioPush` | Cambiar una implementación no obliga a cambiar a quien la usa |
| **Variaciones Protegidas** (GRASP) | `TrmApiAdapter` guarda las últimas tasas | Si la API externa falla, el sistema sigue funcionando |
| **Fábrica** (creacional) | `TransaccionFactory` | Un solo lugar decide qué subclase de `Transaccion` crear |
| **Adaptador** (estructural) | `TrmApiAdapter`, `FcmAdapter` | Traducen servicios externos a las interfaces del negocio |
| **Repositorio** | `repository/*Repository` (Spring Data) | Aísla el acceso a MongoDB de la lógica de negocio |
