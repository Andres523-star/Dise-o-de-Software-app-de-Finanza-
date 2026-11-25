package com.misfinanzas.model;

import java.time.LocalDate;

/**
 * Gasto. Resta del saldo de la cuenta (HU-05).
 * Igual que en la PWA, un gasto puede dejar la cuenta en negativo: la app lo muestra como alerta.
 */
public class Egreso extends Transaccion {

    private String comercio;

    public Egreso() {
    }

    public Egreso(String tableroId, String cuentaId, String categoriaId, double monto,
                  LocalDate fecha, String descripcion, String comercio) {
        super(tableroId, cuentaId, categoriaId, monto, fecha, descripcion);
        this.comercio = comercio;
    }

    @Override
    public void aplicar(Cuenta cuenta) {
        cuenta.actualizarSaldo(-getMonto());
    }

    @Override
    public void revertir(Cuenta cuenta) {
        cuenta.actualizarSaldo(getMonto());
    }

    @Override
    public TipoTransaccion getTipo() {
        return TipoTransaccion.EGRESO;
    }

    public String getComercio() { return comercio; }
    public void setComercio(String comercio) { this.comercio = comercio; }
}
