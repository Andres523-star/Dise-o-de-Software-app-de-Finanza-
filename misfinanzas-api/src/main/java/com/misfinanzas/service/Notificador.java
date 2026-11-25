package com.misfinanzas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.adapter.IServicioPush;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.model.Notificacion;
import com.misfinanzas.model.TipoNotificacion;
import com.misfinanzas.repository.NotificacionRepository;

/** Guarda la notificación (para verla en la app) y la envía como push por el adaptador. */
@Service
public class Notificador implements INotificador {

    private final NotificacionRepository notificaciones;
    private final IServicioPush push;

    public Notificador(NotificacionRepository notificaciones, IServicioPush push) {
        this.notificaciones = notificaciones;
        this.push = push;
    }

    @Override
    public Notificacion notificar(String tableroId, TipoNotificacion tipo, String titulo, String mensaje) {
        Notificacion n = notificaciones.save(new Notificacion(tableroId, tipo, titulo, mensaje));
        push.enviar(tableroId, titulo, mensaje);
        return n;
    }

    @Override
    public List<Notificacion> listar(String tableroId) {
        return notificaciones.findByTableroIdOrderByFechaDesc(tableroId);
    }

    @Override
    public Notificacion marcarLeida(String id) {
        Notificacion n = notificaciones.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificación", id));
        n.setLeida(true);
        return notificaciones.save(n);
    }
}
