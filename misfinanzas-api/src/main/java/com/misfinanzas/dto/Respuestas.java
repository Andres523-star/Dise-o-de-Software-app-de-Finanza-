package com.misfinanzas.dto;

import java.time.LocalDate;
import java.util.List;

import com.misfinanzas.model.Abono;
import com.misfinanzas.model.Ahorro;
import com.misfinanzas.model.Egreso;
import com.misfinanzas.model.Ingreso;
import com.misfinanzas.model.Membresia;
import com.misfinanzas.model.MetaAhorro;
import com.misfinanzas.model.Presupuesto;
import com.misfinanzas.model.Tablero;
import com.misfinanzas.model.TipoTablero;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.model.Transaccion;

/** Respuestas JSON de la API (lo que ve Postman). */
public final class Respuestas {

    private Respuestas() {
    }

    public record TableroResponse(String id, String nombre, TipoTablero tipo, String moneda,
                                  String propietarioId, List<Membresia> miembros, double balance) {
        public static TableroResponse de(Tablero t, double balance) {
            return new TableroResponse(t.getId(), t.getNombre(), t.getTipo(), t.getMoneda(),
                    t.getPropietarioId(), t.getMiembros(), balance);
        }
    }

    public record TransaccionResponse(String id, TipoTransaccion tipo, double monto, LocalDate fecha,
                                      String descripcion, String detalle, String cuentaId, String categoriaId,
                                      double saldoCuenta) {
        public static TransaccionResponse de(Transaccion t, double saldoCuenta) {
            String detalle = null;
            if (t instanceof Ingreso i) {
                detalle = i.getFuente();
            } else if (t instanceof Egreso e) {
                detalle = e.getComercio();
            } else if (t instanceof Ahorro a) {
                detalle = a.getMetaId();
            }
            return new TransaccionResponse(t.getId(), t.getTipo(), t.getMonto(), t.getFecha(), t.getDescripcion(),
                    detalle, t.getCuentaId(), t.getCategoriaId(), saldoCuenta);
        }
    }

    /** Estado de un presupuesto con su porcentaje y el color de la barra. */
    public record PresupuestoResponse(String id, String categoriaId, int mes, int anio, double limite,
                                      double gastado, double disponible, double porcentajeConsumido,
                                      String estado, List<Integer> alertasEnviadas) {
        public static PresupuestoResponse de(Presupuesto p) {
            double porcentaje = p.porcentajeConsumido();
            String estado = porcentaje >= 100 ? "LIMITE_ALCANZADO" : porcentaje >= 80 ? "ADVERTENCIA" : "NORMAL";
            return new PresupuestoResponse(p.getId(), p.getCategoriaId(), p.getMes(), p.getAnio(), p.getLimite(),
                    p.getGastado(), p.disponible(), porcentaje, estado, p.getUmbralesNotificados());
        }
    }

    public record MetaResponse(String id, String nombre, double montoObjetivo, double montoActual,
                               double faltante, double porcentaje, boolean completada,
                               LocalDate fechaLimite, List<Abono> abonos) {
        public static MetaResponse de(MetaAhorro m) {
            return new MetaResponse(m.getId(), m.getNombre(), m.getMontoObjetivo(), m.getMontoActual(),
                    m.faltante(), m.porcentaje(), m.completada(), m.getFechaLimite(), m.getAbonos());
        }
    }

    /** Resumen del mes para la pantalla principal (HU-21). */
    public record ResumenMes(String tableroId, int mes, int anio, double ingresos, double egresos,
                             double ahorro, double balanceMes, double saldoTotalCuentas, int cantidadMovimientos) {
    }

    public record ConversionResponse(double monto, String de, String a, double tasa, double resultado) {
    }
}
