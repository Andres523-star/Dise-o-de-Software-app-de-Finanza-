package com.misfinanzas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Persona que usa la app. En la PWA el login lo hace Firebase Auth (Google, Apple o correo). */
@Document("usuarios")
public class Usuario {

    @Id
    private String id;
    private String nombre;
    private String email;
    private String proveedorAuth;
    private String perfilFinanciero;

    public Usuario() {
    }

    public Usuario(String nombre, String email, String proveedorAuth) {
        this.nombre = nombre;
        this.email = email == null ? null : email.trim().toLowerCase();
        this.proveedorAuth = proveedorAuth;
    }

    /** Guarda el resultado del test de personalidad financiera (onboarding). */
    public void completarOnboarding(String perfil) {
        this.perfilFinanciero = perfil;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProveedorAuth() { return proveedorAuth; }
    public void setProveedorAuth(String proveedorAuth) { this.proveedorAuth = proveedorAuth; }
    public String getPerfilFinanciero() { return perfilFinanciero; }
    public void setPerfilFinanciero(String perfilFinanciero) { this.perfilFinanciero = perfilFinanciero; }
}
