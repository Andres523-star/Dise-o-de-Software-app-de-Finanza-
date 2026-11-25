package com.misfinanzas.model;

import java.time.LocalDate;

/**
 * Dinero que se aparta para ahorrar. A diferencia del gasto, NO se permite apartar
 * más de lo que hay en la cuenta (misma regla que la PWA: "No tienes esa cantidad disponible").
 */
public class Ahorro extends Transaccion {

    private String metaId;

    public Ahorro() {
    }

    public Ahorro(String tableroId, String cuentaId, String categoriaId, double monto,
                  LocalDate fecha, String descripcion, String metaId) {
        super(tableroId, cuentaId, categoriaId, monto, fecha, descripcion);
        this.metaId = metaId;
    }

    @Override
    public void aplicar(Cuenta cuenta) {
        cuenta.verificarFondos(getMonto());
        cuenta.actualizarSaldo(-getMonto());
    }

    @Override
    public void revertir(Cuenta cuenta) {
        cuenta.actualizarSaldo(getMonto());
    }

    @Override
    public TipoTransaccion getTipo() {
        return TipoTransaccion.AHORRO;
    }

    public String getMetaId() { return metaId; }
    public void setMetaId(String metaId) { this.metaId = metaId; }
}
