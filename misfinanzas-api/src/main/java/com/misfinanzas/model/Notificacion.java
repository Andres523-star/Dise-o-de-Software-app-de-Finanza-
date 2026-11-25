package com.misfinanzas.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Aviso enviado al usuario (alerta de presupuesto, cobro próximo, meta cumplida). */
@Document("notificaciones")
public class Notificacion {

    @Id
    private String id;
    private String tableroId;
    private TipoNotificacion tipo;
    private String titulo;
    private String mensaje;
    private LocalDateTime fecha;
    private boolean leida;

    public Notificacion() {
    }

    public Notificacion(String tableroId, TipoNotificacion tipo, String titulo, String mensaje) {
        this.tableroId = tableroId;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.fecha = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTableroId() { return tableroId; }
    public void setTableroId(String tableroId) { this.tableroId = tableroId; }
    public TipoNotificacion getTipo() { return tipo; }
    public void setTipo(TipoNotificacion tipo) { this.tipo = tipo; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }
}
