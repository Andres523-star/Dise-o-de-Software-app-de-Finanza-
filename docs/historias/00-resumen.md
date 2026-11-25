# Historias de usuario: Mis Finanzas

21 historias en 8 épicas. Cada historia está en su propio archivo con:
**Como / Quiero / Para**, validación **INVEST** y criterios de aceptación en **Gherkin en español**.

- **Prioridad:** Alta, Media o Baja.
- **Puntos de historia:** 1, 2, 3, 5 u 8 (esfuerzo relativo).
- **Implementación:** dónde se puede comprobar la historia.
  - **PWA:** la app web en Firebase.
  - **API Java:** la implementación representativa en `misfinanzas-api/` (Spring Boot + MongoDB).

| ID | Historia | Valor de negocio | Prioridad | Puntos | Implementación | Archivo |
|---|---|---|---|---|---|---|
| **Épica 1: Autenticación y onboarding** |||||||
| HU-01 | Iniciar sesión con Google, Apple o correo | Datos protegidos y acceso rápido | Alta | 5 | PWA | [HU-01](HU-01-iniciar-sesion.md) |
| HU-02 | Test de personalidad financiera | Recomendaciones personalizadas | Media | 3 | PWA | [HU-02](HU-02-test-de-personalidad-financiera.md) |
| **Épica 2: Tableros y colaboración** |||||||
| HU-03 | Crear varios tableros | Separar finanzas personales y de negocio | Alta | 5 | PWA + API Java | [HU-03](HU-03-crear-varios-tableros.md) |
| HU-04 | Invitar a otra persona a un tablero | Finanzas en pareja o con socios | Media | 8 | PWA + API Java | [HU-04](HU-04-invitar-a-un-tablero.md) |
| **Épica 3: Cuentas y transacciones** |||||||
| HU-05 | Registrar un gasto | Saber en qué se va el dinero | Alta | 3 | PWA + API Java | [HU-05](HU-05-registrar-un-gasto.md) |
| HU-06 | Registrar un ingreso | Saber cuánto entra cada mes | Alta | 2 | PWA + API Java | [HU-06](HU-06-registrar-un-ingreso.md) |
| HU-07 | Manejar varias cuentas | Saber cuánto hay en cada cuenta | Alta | 3 | PWA + API Java | [HU-07](HU-07-manejar-varias-cuentas.md) |
| HU-08 | Editar o eliminar una transacción | Saldos siempre exactos | Alta | 2 | PWA + API Java | [HU-08](HU-08-editar-o-eliminar-transaccion.md) |
| HU-09 | Personalizar categorías | Organizar a mi manera | Media | 3 | PWA + API Java | [HU-09](HU-09-personalizar-categorias.md) |
| **Épica 4: Presupuestos y alertas** |||||||
| HU-10 | Presupuesto mensual por categoría | Controlar el gasto | Alta | 3 | PWA + API Java | [HU-10](HU-10-presupuesto-mensual-por-categoria.md) |
| HU-11 | Alertas al 80 %, 90 % y 100 % | Frenar el gasto a tiempo | Alta | 3 | PWA + API Java | [HU-11](HU-11-alertas-de-presupuesto.md) |
| **Épica 5: Metas de ahorro** |||||||
| HU-12 | Crear una meta de ahorro | Ahorrar con propósito | Media | 3 | PWA + API Java | [HU-12](HU-12-crear-meta-de-ahorro.md) |
| HU-13 | Abonar a una meta | Avanzar en el ahorro | Media | 3 | PWA + API Java | [HU-13](HU-13-abonar-a-una-meta.md) |
| **Épica 6: Cobros recurrentes y notificaciones** |||||||
| HU-14 | Registrar cobros recurrentes | No anotar lo mismo cada mes | Media | 5 | PWA + API Java | [HU-14](HU-14-registrar-cobros-recurrentes.md) |
| HU-15 | Recordatorio push de cobros | Tener el dinero listo | Media | 5 | PWA (+ registro en API) | [HU-15](HU-15-recordatorio-push-de-cobros.md) |
| **Épica 7: Divisas y Analista Financiero** |||||||
| HU-16 | Usar varias monedas | Ver montos convertidos | Media | 5 | PWA + API Java | [HU-16](HU-16-usar-varias-monedas.md) |
| HU-17 | Semáforo de compra/venta de divisas | Decidir con datos | Baja | 5 | PWA | [HU-17](HU-17-semaforo-de-divisas.md) |
| **Épica 8: Experiencia (PWA)** |||||||
| HU-18 | Instalar la app y usarla sin internet | Usarla en cualquier lugar | Alta | 5 | PWA | [HU-18](HU-18-usar-la-app-sin-internet.md) |
| HU-19 | Exportar e importar datos | Respaldo de la información | Baja | 3 | PWA | [HU-19](HU-19-exportar-e-importar-datos.md) |
| HU-20 | Cambiar el idioma | Usarla en mi idioma | Baja | 2 | PWA | [HU-20](HU-20-cambiar-idioma.md) |
| HU-21 | Ver balance y resumen del mes | Entender mi situación de un vistazo | Alta | 3 | PWA + API Java | [HU-21](HU-21-balance-y-resumen-del-mes.md) |
| | | | | **79** | | |

La relación entre cada historia, las clases del diagrama, el código Java y las pruebas está en
[`../trazabilidad.md`](../trazabilidad.md).
