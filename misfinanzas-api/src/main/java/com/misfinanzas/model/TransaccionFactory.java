package com.misfinanzas.model;

import java.time.LocalDate;

/**
 * Patrón creacional "Fábrica" (Factory): concentra en un solo lugar la decisión de qué
 * subclase de Transaccion crear. Si mañana aparece un nuevo tipo, solo se toca aquí.
 */
public final class TransaccionFactory {

    private TransaccionFactory() {
    }

    // 📌 PRESENTACION 09 ¿DÓNDE SE CREA LA TRANSACCIÓN? PATRÓN FÁBRICA
    public static Transaccion crear(TipoTransaccion tipo, String tableroId, String cuentaId, String categoriaId,
                                    double monto, LocalDate fecha, String descripcion, String detalle) {
        LocalDate dia = fecha != null ? fecha : LocalDate.now();
        return switch (tipo) {
            case INGRESO -> new Ingreso(tableroId, cuentaId, categoriaId, monto, dia, descripcion, detalle);
            case EGRESO -> new Egreso(tableroId, cuentaId, categoriaId, monto, dia, descripcion, detalle);
            case AHORRO -> new Ahorro(tableroId, cuentaId, categoriaId, monto, dia, descripcion, detalle);
        };
    }
}
