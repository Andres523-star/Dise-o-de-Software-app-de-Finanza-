package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.dto.Respuestas.ResumenMes;
import com.misfinanzas.dto.Respuestas.TableroResponse;
import com.misfinanzas.dto.Solicitudes.CrearTablero;
import com.misfinanzas.dto.Solicitudes.InvitarMiembro;
import com.misfinanzas.model.Tablero;

/** Tableros y colaboración (HU-03, HU-04) y resumen del mes (HU-21). */
public interface IGestorTableros {

    TableroResponse crear(CrearTablero solicitud);

    TableroResponse obtener(String id);

    List<TableroResponse> listarPorUsuario(String usuarioId);

    TableroResponse renombrar(String id, String nombre);

    void eliminar(String id);

    TableroResponse invitar(String id, InvitarMiembro solicitud);

    ResumenMes resumen(String id, int mes, int anio);

    /** Devuelve el tablero o lanza 404. Lo usan los demás gestores para validar el tableroId. */
    Tablero buscar(String id);
}
