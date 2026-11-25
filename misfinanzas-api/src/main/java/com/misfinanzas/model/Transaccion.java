package com.misfinanzas.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Clase abstracta del diagrama de clases. Ingreso, Egreso y Ahorro la heredan y cada una
 * implementa aplicar() a su manera (Polimorfismo): el servicio no necesita preguntar
 * "¿es ingreso o egreso?", solo llama a aplicar().
 *
 * Las tres se guardan en la misma colección "transacciones"; MongoDB guarda la subclase en el campo _class.
 */
@Document("transacciones")
public abstract class Transaccion {

    @Id
    private String id;
    private String tableroId;
    private String cuentaId;
    private String categoriaId;
    private double monto;
    private LocalDate fecha;
    private String descripcion;

    protected Transaccion() {
    }

    protected Transaccion(String tableroId, String cuentaId, String categoriaId,
                          double monto, LocalDate fecha, String descripcion) {
        this.tableroId = tableroId;
        this.cuentaId = cuentaId;
        this.categoriaId = categoriaId;
        this.monto = monto;
        this.fecha = fecha;
        this.descripcion = descripcion;
    }

    /** Aplica el efecto de la transacción sobre el saldo de la cuenta. */
    public abstract void aplicar(Cuenta cuenta);

    /** Deshace el efecto (al eliminar o editar la transacción). */
    public abstract void revertir(Cuenta cuenta);

    public abstract TipoTransaccion getTipo();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTableroId() { return tableroId; }
    public void setTableroId(String tableroId) { this.tableroId = tableroId; }
    public String getCuentaId() { return cuentaId; }
    public void setCuentaId(String cuentaId) { this.cuentaId = cuentaId; }
    public String getCategoriaId() { return categoriaId; }
    public void setCategoriaId(String categoriaId) { this.categoriaId = categoriaId; }
    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
