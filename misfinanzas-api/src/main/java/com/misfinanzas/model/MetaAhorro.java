package com.misfinanzas.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.misfinanzas.exception.ReglaNegocioException;

/** Meta de ahorro con propósito: viaje, moto... (HU-12, HU-13). */
@Document("metas")
public class MetaAhorro {

    @Id
    private String id;
    private String tableroId;
    private String nombre;
    private double montoObjetivo;
    private double montoActual;
    private LocalDate fechaLimite;
    private List<Abono> abonos = new ArrayList<>();

    public MetaAhorro() {
    }

    public MetaAhorro(String tableroId, String nombre, double montoObjetivo, LocalDate fechaLimite) {
        this.tableroId = tableroId;
        this.nombre = nombre;
        this.montoObjetivo = montoObjetivo;
        this.fechaLimite = fechaLimite;
    }

    /** Pasa dinero de una cuenta a la meta. La cuenta debe tener saldo suficiente. */
    public void abonar(double monto, Cuenta origen) {
        if (completada()) {
            throw new ReglaNegocioException("La meta '" + nombre + "' ya está completada");
        }
        origen.verificarFondos(monto);
        origen.actualizarSaldo(-monto);
        montoActual += monto;
        abonos.add(new Abono(monto, LocalDate.now(), origen.getId()));
    }

    public double porcentaje() {
        if (montoObjetivo <= 0) {
            return 0;
        }
        return Math.min(100.0, Math.round(montoActual / montoObjetivo * 1000.0) / 10.0);
    }

    public double faltante() {
        return Math.max(0, montoObjetivo - montoActual);
    }

    public boolean completada() {
        return montoActual >= montoObjetivo;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTableroId() { return tableroId; }
    public void setTableroId(String tableroId) { this.tableroId = tableroId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public double getMontoObjetivo() { return montoObjetivo; }
    public void setMontoObjetivo(double montoObjetivo) { this.montoObjetivo = montoObjetivo; }
    public double getMontoActual() { return montoActual; }
    public void setMontoActual(double montoActual) { this.montoActual = montoActual; }
    public LocalDate getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDate fechaLimite) { this.fechaLimite = fechaLimite; }
    public List<Abono> getAbonos() { return abonos; }
    public void setAbonos(List<Abono> abonos) { this.abonos = abonos; }
}
