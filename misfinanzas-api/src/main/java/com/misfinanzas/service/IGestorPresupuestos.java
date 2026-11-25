package com.misfinanzas.service;

import java.time.LocalDate;
import java.util.List;

import com.misfinanzas.dto.Respuestas.PresupuestoResponse;
import com.misfinanzas.dto.Solicitudes.CrearPresupuesto;

/** IGestorPresupuestos del diagrama 2 (HU-10, HU-11). */
public interface IGestorPresupuestos {

    PresupuestoResponse crear(String tableroId, CrearPresupuesto solicitud);

    List<PresupuestoResponse> listar(String tableroId, int mes, int anio);

    PresupuestoResponse obtener(String id);

    /**
     * Recalcula lo gastado en una categoría para el mes de la fecha y envía las alertas
     * 80% / 90% / 100% que correspondan. Lo llama GestorTransacciones ("verifica umbral").
     */
    void verificarUmbral(String tableroId, String categoriaId, LocalDate fecha);
}
