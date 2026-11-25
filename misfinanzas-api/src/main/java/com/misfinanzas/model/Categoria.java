package com.misfinanzas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Categoría para clasificar movimientos (Comida 🍕, Transporte 🚌, Salario 💼...) (HU-09). */
@Document("categorias")
public class Categoria {

    @Id
    private String id;
    private String tableroId;
    private String nombre;
    private String icono;
    private String color;
    private TipoTransaccion tipo;

    public Categoria() {
    }

    public Categoria(String tableroId, String nombre, String icono, String color, TipoTransaccion tipo) {
        this.tableroId = tableroId;
        this.nombre = nombre;
        this.icono = icono;
        this.color = color;
        this.tipo = tipo;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTableroId() { return tableroId; }
    public void setTableroId(String tableroId) { this.tableroId = tableroId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public TipoTransaccion getTipo() { return tipo; }
    public void setTipo(TipoTransaccion tipo) { this.tipo = tipo; }
}
