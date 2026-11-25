package com.misfinanzas.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.misfinanzas.exception.ReglaNegocioException;

/**
 * Tablero de finanzas (Personal o Negocio). Es el "todo" de la composición:
 * sus cuentas, categorías, transacciones, presupuestos, metas y cobros guardan su tableroId.
 */
@Document("tableros")
public class Tablero {

    @Id
    private String id;
    private String nombre;
    private TipoTablero tipo;
    private String moneda;
    private String propietarioId;
    private List<Membresia> miembros = new ArrayList<>();

    public Tablero() {
    }

    public Tablero(String nombre, TipoTablero tipo, String moneda, String propietarioId) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.moneda = moneda;
        this.propietarioId = propietarioId;
        this.miembros.add(new Membresia(propietarioId, RolTablero.PROPIETARIO));
    }

    /** Agrega a otra persona al tablero con un rol (HU-04). */
    public void invitar(Usuario usuario, RolTablero rol) {
        if (rol == RolTablero.PROPIETARIO) {
            throw new ReglaNegocioException("Un tablero solo puede tener un propietario");
        }
        if (esMiembro(usuario.getId())) {
            throw new ReglaNegocioException("Esa persona ya es miembro del tablero");
        }
        miembros.add(new Membresia(usuario.getId(), rol));
    }

    public boolean esMiembro(String usuarioId) {
        return miembros.stream().anyMatch(m -> m.getUsuarioId().equals(usuarioId));
    }

    /** Balance total del tablero = suma de los saldos de sus cuentas (Experto en Información). */
    public double calcularBalance(List<Cuenta> cuentas) {
        return cuentas.stream().mapToDouble(Cuenta::getSaldo).sum();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public TipoTablero getTipo() { return tipo; }
    public void setTipo(TipoTablero tipo) { this.tipo = tipo; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public String getPropietarioId() { return propietarioId; }
    public void setPropietarioId(String propietarioId) { this.propietarioId = propietarioId; }
    public List<Membresia> getMiembros() { return miembros; }
    public void setMiembros(List<Membresia> miembros) { this.miembros = miembros; }
}
