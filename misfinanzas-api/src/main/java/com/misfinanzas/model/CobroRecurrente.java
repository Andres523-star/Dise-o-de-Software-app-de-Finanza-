package com.misfinanzas.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Suscripción o salario que se repite (HU-14). Patrón Creador: el cobro tiene los datos
 * necesarios para crear la transacción, así que él mismo la genera («crea» en el diagrama).
 */
@Document("cobros")
public class CobroRecurrente {

    @Id
    private String id;
    private String tableroId;
    private String cuentaId;
    private String categoriaId;
    private String nombre;
    private double monto;
    private Frecuencia frecuencia;
    private LocalDate proximaFecha;
    private boolean esIngreso;

    public CobroRecurrente() {
    }

    public CobroRecurrente(String tableroId, String cuentaId, String categoriaId, String nombre,
                           double monto, Frecuencia frecuencia, LocalDate proximaFecha, boolean esIngreso) {
        this.tableroId = tableroId;
        this.cuentaId = cuentaId;
        this.categoriaId = categoriaId;
        this.nombre = nombre;
        this.monto = monto;
        this.frecuencia = frecuencia;
        this.proximaFecha = proximaFecha;
        this.esIngreso = esIngreso;
    }

    /** Crea la transacción de este periodo y calcula la próxima fecha de cobro. */
    public Transaccion generarTransaccion() {
        LocalDate fecha = proximaFecha;
        Transaccion t = esIngreso
                ? new Ingreso(tableroId, cuentaId, categoriaId, monto, fecha, nombre, nombre)
                : new Egreso(tableroId, cuentaId, categoriaId, monto, fecha, nombre, nombre);
        proximaFecha = frecuencia.siguienteFecha(proximaFecha);
        return t;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTableroId() { return tableroId; }
    public void setTableroId(String tableroId) { this.tableroId = tableroId; }
    public String getCuentaId() { return cuentaId; }
    public void setCuentaId(String cuentaId) { this.cuentaId = cuentaId; }
    public String getCategoriaId() { return categoriaId; }
    public void setCategoriaId(String categoriaId) { this.categoriaId = categoriaId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }
    public Frecuencia getFrecuencia() { return frecuencia; }
    public void setFrecuencia(Frecuencia frecuencia) { this.frecuencia = frecuencia; }
    public LocalDate getProximaFecha() { return proximaFecha; }
    public void setProximaFecha(LocalDate proximaFecha) { this.proximaFecha = proximaFecha; }
    public boolean isEsIngreso() { return esIngreso; }
    public void setEsIngreso(boolean esIngreso) { this.esIngreso = esIngreso; }
}
