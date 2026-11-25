package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.dto.Respuestas.TransaccionResponse;
import com.misfinanzas.dto.Solicitudes.CrearCobro;
import com.misfinanzas.model.CobroRecurrente;

/** Cobros recurrentes (HU-14, HU-15). */
public interface IGestorCobros {

    CobroRecurrente crear(String tableroId, CrearCobro solicitud);

    List<CobroRecurrente> listar(String tableroId);

    /** Genera la transacción del periodo y deja programada la próxima fecha. */
    TransaccionResponse generar(String cobroId);
}
