package com.misfinanzas.adapter;

import java.util.Map;

/**
 * Interfaz del diagrama 2 (Adaptadores externos). El negocio depende de esta interfaz y no de
 * la API concreta (Variaciones Protegidas / Inversión de Dependencias): si cambiamos de proveedor
 * de tasas, solo se cambia el adaptador.
 */
public interface IProveedorDivisas {

    /** Tasas de cambio con base en la moneda indicada, ej. base COP -> {USD: 0.00025, EUR: ...}. */
    Map<String, Double> obtenerTasas(String monedaBase);
}
