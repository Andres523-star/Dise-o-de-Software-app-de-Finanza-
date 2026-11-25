package com.misfinanzas.model;

import java.time.LocalDate;

/** Clase de asociación Usuario–Tablero: qué rol tiene cada persona en un tablero. */
public class Membresia {

    private String usuarioId;
    private RolTablero rol;
    private LocalDate fechaIngreso;

    public Membresia() {
    }

    public Membresia(String usuarioId, RolTablero rol) {
        this.usuarioId = usuarioId;
        this.rol = rol;
        this.fechaIngreso = LocalDate.now();
    }

    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }
    public RolTablero getRol() { return rol; }
    public void setRol(RolTablero rol) { this.rol = rol; }
    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDate fechaIngreso) { this.fechaIngreso = fechaIngreso; }
}
