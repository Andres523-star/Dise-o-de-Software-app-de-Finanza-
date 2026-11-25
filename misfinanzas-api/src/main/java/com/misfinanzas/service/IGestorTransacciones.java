package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.dto.Respuestas.TransaccionResponse;
import com.misfinanzas.dto.Solicitudes.RegistrarTransaccion;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.model.Transaccion;

/** IGestorTransacciones del diagrama 2 (HU-05, HU-06, HU-08). */
public interface IGestorTransacciones {

    TransaccionResponse registrar(String tableroId, RegistrarTransaccion solicitud);

    /** Registra una transacción ya creada (la usa el cobro recurrente al generar su movimiento). */
    TransaccionResponse registrar(Transaccion transaccion);

    TransaccionResponse editar(String id, RegistrarTransaccion solicitud);

    void eliminar(String id);

    TransaccionResponse obtener(String id);

    List<TransaccionResponse> listar(String tableroId, TipoTransaccion tipo, Integer mes, Integer anio);
}
