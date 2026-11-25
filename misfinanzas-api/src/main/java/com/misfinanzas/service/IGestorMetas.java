package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.dto.Respuestas.MetaResponse;
import com.misfinanzas.dto.Solicitudes.Abonar;
import com.misfinanzas.dto.Solicitudes.CrearMeta;

/** Metas de ahorro (HU-12, HU-13). */
public interface IGestorMetas {

    MetaResponse crear(String tableroId, CrearMeta solicitud);

    List<MetaResponse> listar(String tableroId);

    MetaResponse abonar(String metaId, Abonar solicitud);
}
