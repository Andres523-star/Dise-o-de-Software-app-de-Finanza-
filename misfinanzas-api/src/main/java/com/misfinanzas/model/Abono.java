package com.misfinanzas.model;

import java.time.LocalDate;

/** Cada aporte que se hace a una meta de ahorro. Vive dentro de la meta (composición). */
public class Abono {

    private double monto;
    private LocalDate fecha;
    private String cuentaOrigenId;

    public Abono() {
    }

    public Abono(double monto, LocalDate fecha, String cuentaOrigenId) {
        this.monto = monto;
        this.fecha = fecha;
        this.cuentaOrigenId = cuentaOrigenId;
    }

    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getCuentaOrigenId() { return cuentaOrigenId; }
    public void setCuentaOrigenId(String cuentaOrigenId) { this.cuentaOrigenId = cuentaOrigenId; }
}
