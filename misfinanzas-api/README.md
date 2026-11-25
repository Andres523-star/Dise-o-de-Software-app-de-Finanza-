# misfinanzas-api: implementación representativa en Java

API REST de **Mis Finanzas** hecha con **Java 25 + Spring Boot 3.5 + MongoDB**.
Sirve para validar el diseño: las clases del **diagrama 3 (vista lógica)** y las capas del
**diagrama 2 (vista funcional)** están implementadas tal cual en código.

> La app que usan los usuarios es la PWA (Firebase). Esta API implementa en Java el núcleo del diseño:
> tableros, cuentas, categorías, transacciones, presupuestos con alertas, metas de ahorro, cobros
> recurrentes y divisas.

## Cómo está organizada (diagrama 4, vista de desarrollo)

```
src/main/java/com/misfinanzas/
├── controller/   Capa de Presentación  → TransaccionController, PresupuestoController, DivisasController…
├── service/      Capa de Negocio       → IGestorTransacciones + GestorTransacciones, IGestorPresupuestos…
├── repository/   Capa de Datos         → TransaccionRepository, CuentaRepository… (Spring Data MongoDB)
├── adapter/      Adaptadores externos  → IProveedorDivisas + TrmApiAdapter, IServicioPush + FcmAdapter
├── model/        Clases del diagrama 3 → Tablero, Cuenta, Categoria, Transaccion (Ingreso/Egreso/Ahorro)…
├── dto/          Datos que entran y salen en JSON
├── exception/    Errores con mensajes claros (400, 404, 422, 503)
└── config/       Datos de demostración
```

Flujo de "registrar un gasto" (igual que `saveTransaction()` de la PWA):

```
TransaccionController → GestorTransacciones → TransaccionFactory crea un Egreso
                      → Egreso.aplicar(cuenta) resta el saldo
                      → TransaccionRepository guarda en MongoDB
                      → GestorPresupuestos.verificarUmbral() → Notificador (alerta 80/90/100 %)
```

## Cómo ejecutarla

**Requisito:** Java 25 o superior. La forma más fácil es **IntelliJ IDEA** (trae Maven incluido).

1. En IntelliJ: **File → Open** y elige la carpeta `misfinanzas-api`.
2. Espera a que descargue las dependencias (barra de abajo).
3. Abre `MisFinanzasApplication.java` y haz clic en el botón verde ▶ **Run**.
4. Cuando la consola diga `Started MisFinanzasApplication`, la API está en **http://localhost:8080**.

Con terminal (si tienes Maven): `cd misfinanzas-api && mvn spring-boot:run`

**Base de datos:** por defecto usa un **MongoDB embebido**, así que no hay que instalar nada.
La primera vez descarga MongoDB (puede tardar unos minutos). Al arrancar carga datos de ejemplo:
tablero `tablero-demo`, cuentas `cta-nu`, `cta-nequi`, `cta-efectivo`, categorías `cat-comida`,
`cat-salario`, etc.

Para usar un MongoDB real (local o Atlas), ejecuta con el perfil `mongo`:
`MONGODB_URI="mongodb+srv://..." mvn spring-boot:run -Dspring-boot.run.profiles=mongo`

## Probarla

- **Swagger (documentación interactiva):** http://localhost:8080/swagger-ui.html
- **Postman:** importa `postman/MisFinanzas-API-Java.postman_collection.json` y dale **Run**.
  Usa la app de escritorio de Postman (o el *Desktop Agent*), porque la API corre en `localhost`.
- **Pruebas automáticas (JUnit):** en IntelliJ, clic derecho en `src/test/java` → **Run 'All Tests'**,
  o `mvn test`. Prueban el polimorfismo de las transacciones, las alertas del presupuesto, las metas y
  los cobros recurrentes.

## Endpoints principales

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/tableros/{id}` | Tablero con su balance |
| GET | `/api/tableros/{id}/resumen` | Ingresos, gastos, ahorro y balance del mes |
| POST | `/api/tableros` | Crear tablero |
| POST | `/api/tableros/{id}/miembros` | Invitar a alguien por correo |
| GET/POST | `/api/tableros/{id}/cuentas` | Cuentas y saldos |
| GET/POST | `/api/tableros/{id}/categorias` | Categorías (`?buscar=com`) |
| GET/POST | `/api/tableros/{id}/transacciones` | Registrar o listar ingresos, gastos y ahorros |
| PUT/DELETE | `/api/transacciones/{id}` | Editar o eliminar (recalcula el saldo) |
| GET/POST | `/api/tableros/{id}/presupuestos` | Presupuestos con % consumido |
| POST | `/api/metas/{id}/abonos` | Abonar a una meta de ahorro |
| POST | `/api/cobros/{id}/generar` | Registrar un cobro recurrente |
| GET | `/api/tableros/{id}/notificaciones` | Alertas enviadas |
| GET | `/api/divisas/{base}` · `/api/divisas/convertir` | Tasas de cambio (TRM) |

Ejemplo para registrar un gasto:

```json
POST /api/tableros/tablero-demo/transacciones
{
  "tipo": "EGRESO",
  "monto": 200000,
  "cuentaId": "cta-nu",
  "categoriaId": "cat-comida",
  "descripcion": "Mercado"
}
```

La trazabilidad completa (historia → clase → código → endpoint → prueba) está en
[`../docs/trazabilidad.md`](../docs/trazabilidad.md).
