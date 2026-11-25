package com.misfinanzas.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.misfinanzas.adapter.IProveedorDivisas;
import com.misfinanzas.dto.Respuestas.ConversionResponse;
import com.misfinanzas.exception.ReglaNegocioException;

/** Convierte montos entre monedas usando el proveedor de tasas (a través de su interfaz). */
@Service
public class AnalistaDivisas implements IAnalistaDivisas {

    private final IProveedorDivisas proveedor;

    public AnalistaDivisas(IProveedorDivisas proveedor) {
        this.proveedor = proveedor;
    }

    @Override
    public Map<String, Double> tasas(String monedaBase) {
        return proveedor.obtenerTasas(monedaBase);
    }

    @Override
    public ConversionResponse convertir(double monto, String de, String a) {
        if (monto <= 0) {
            throw new ReglaNegocioException("El monto debe ser mayor a cero");
        }
        String origen = de.trim().toUpperCase();
        String destino = a.trim().toUpperCase();
        Double tasa = proveedor.obtenerTasas(origen).get(destino);
        if (tasa == null) {
            throw new ReglaNegocioException("No hay tasa de " + origen + " a " + destino);
        }
        double resultado = Math.round(monto * tasa * 100.0) / 100.0;
        return new ConversionResponse(monto, origen, destino, tasa, resultado);
    }
}
