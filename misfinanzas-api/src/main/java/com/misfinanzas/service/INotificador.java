package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.model.Notificacion;
import com.misfinanzas.model.TipoNotificacion;

/** INotificador del diagrama 2. */
public interface INotificador {

    Notificacion notificar(String tableroId, TipoNotificacion tipo, String titulo, String mensaje);

    List<Notificacion> listar(String tableroId);

    Notificacion marcarLeida(String id);
}
