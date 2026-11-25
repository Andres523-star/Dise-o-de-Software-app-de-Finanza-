package com.misfinanzas.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Límite mensual de gasto para una categoría (HU-10, HU-11).
 * Es el Experto en Información: conoce su límite y lo gastado, así que él mismo calcula
 * el porcentaje y decide qué alertas (80%, 90%, 100%) toca enviar.
 */
@Document("presupuestos")
public class Presupuesto {

    /** Umbrales de alerta, igual que en la PWA (balance.js: [80, 90, 100]). */
    public static final int[] UMBRALES = {80, 90, 100};

    @Id
    private String id;
    private String tableroId;
    private String categoriaId;
    private int mes;
    private int anio;
    private double limite;
    private double gastado;
    private List<Integer> umbralesNotificados = new ArrayList<>();

    public Presupuesto() {
    }

    public Presupuesto(String tableroId, String categoriaId, int mes, int anio, double limite) {
        this.tableroId = tableroId;
        this.categoriaId = categoriaId;
        this.mes = mes;
        this.anio = anio;
        this.limite = limite;
    }

    public double porcentajeConsumido() {
        if (limite <= 0) {
            return 0;
        }
        return Math.round(gastado / limite * 1000.0) / 10.0;
    }

    /**
     * Devuelve los umbrales que se acaban de superar y que todavía no se habían avisado.
     * Cada alerta sale una sola vez por mes y categoría.
     */
    // 📌 PRESENTACION 17 ¿DÓNDE ESTÁN LAS ALERTAS DE PRESUPUESTO? 80 %, 90 %, 100 %
    public List<Integer> evaluarUmbral() {
        List<Integer> nuevos = new ArrayList<>();
        double porcentaje = porcentajeConsumido();
        for (int umbral : UMBRALES) {
            if (porcentaje >= umbral && !umbralesNotificados.contains(umbral)) {
                umbralesNotificados.add(umbral);
                nuevos.add(umbral);
            }
        }
        return nuevos;
    }

    public double disponible() {
        return limite - gastado;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTableroId() { return tableroId; }
    public void setTableroId(String tableroId) { this.tableroId = tableroId; }
    public String getCategoriaId() { return categoriaId; }
    public void setCategoriaId(String categoriaId) { this.categoriaId = categoriaId; }
    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }
    public int getAnio() { return anio; }
    public void setAnio(int anio) { this.anio = anio; }
    public double getLimite() { return limite; }
    public void setLimite(double limite) { this.limite = limite; }
    public double getGastado() { return gastado; }
    public void setGastado(double gastado) { this.gastado = gastado; }
    public List<Integer> getUmbralesNotificados() { return umbralesNotificados; }
    public void setUmbralesNotificados(List<Integer> umbralesNotificados) { this.umbralesNotificados = umbralesNotificados; }
}
