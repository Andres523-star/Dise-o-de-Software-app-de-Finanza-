package com.misfinanzas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.misfinanzas.exception.ReglaNegocioException;

/** Cuenta donde está el dinero: Efectivo, Nequi, Nu, Bancolombia... (HU-07). */
@Document("cuentas")
public class Cuenta {

    @Id
    private String id;
    private String tableroId;
    private String nombre;
    private TipoCuenta tipo;
    private String color;
    private double saldo;

    public Cuenta() {
    }

    public Cuenta(String tableroId, String nombre, TipoCuenta tipo, String color, double saldoInicial) {
        this.tableroId = tableroId;
        this.nombre = nombre;
        this.tipo = tipo;
        this.color = color;
        this.saldo = saldoInicial;
    }

    /** Suma (monto positivo) o resta (monto negativo) al saldo. La cuenta cuida su propio saldo. */
    public void actualizarSaldo(double monto) {
        this.saldo += monto;
    }

    /** Verifica que haya dinero suficiente antes de apartarlo (ahorro o abono a una meta). */
    // 📌 PRESENTACION 12 ¿DÓNDE SE VALIDA QUE HAYA PLATA? (Experto en Información)
    public void verificarFondos(double monto) {
        if (monto > saldo) {
            throw new ReglaNegocioException("No tienes esa cantidad disponible en " + nombre
                    + ". Saldo actual: " + saldo);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTableroId() { return tableroId; }
    public void setTableroId(String tableroId) { this.tableroId = tableroId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public TipoCuenta getTipo() { return tipo; }
    public void setTipo(TipoCuenta tipo) { this.tipo = tipo; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public double getSaldo() { return saldo; }
    public void setSaldo(double saldo) { this.saldo = saldo; }
}
