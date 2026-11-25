package com.misfinanzas.model;

import java.time.LocalDate;

/** Dinero que entra (salario, ventas). Suma al saldo de la cuenta (HU-06). */
public class Ingreso extends Transaccion {

    private String fuente;

    public Ingreso() {
    }

    public Ingreso(String tableroId, String cuentaId, String categoriaId, double monto,
                   LocalDate fecha, String descripcion, String fuente) {
        super(tableroId, cuentaId, categoriaId, monto, fecha, descripcion);
        this.fuente = fuente;
    }

    @Override
    // 📌 PRESENTACION 11 ¿DÓNDE SE SUMA UN INGRESO? (polimorfismo)
    public void aplicar(Cuenta cuenta) {
        cuenta.actualizarSaldo(getMonto());
    }

    @Override
    public void revertir(Cuenta cuenta) {
        cuenta.actualizarSaldo(-getMonto());
    }

    @Override
    public TipoTransaccion getTipo() {
        return TipoTransaccion.INGRESO;
    }

    public String getFuente() { return fuente; }
    public void setFuente(String fuente) { this.fuente = fuente; }
}
