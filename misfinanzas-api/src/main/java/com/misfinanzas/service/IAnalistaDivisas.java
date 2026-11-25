package com.misfinanzas.service;

import java.util.Map;

import com.misfinanzas.dto.Respuestas.ConversionResponse;

/** IAnalistaDivisas del diagrama 2 (HU-16). */
public interface IAnalistaDivisas {

    Map<String, Double> tasas(String monedaBase);

    ConversionResponse convertir(double monto, String de, String a);
}
