package com.misfinanzas.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.model.Notificacion;
import com.misfinanzas.service.IGestorTableros;
import com.misfinanzas.service.INotificador;

/** NotificacionController del diagrama 2. */
@RestController
public class NotificacionController {

    private final INotificador notificador;
    private final IGestorTableros tableros;

    public NotificacionController(INotificador notificador, IGestorTableros tableros) {
        this.notificador = notificador;
        this.tableros = tableros;
    }

    @GetMapping("/api/tableros/{tableroId}/notificaciones")
    public List<Notificacion> listar(@PathVariable("tableroId") String tableroId) {
        tableros.buscar(tableroId);
        return notificador.listar(tableroId);
    }

    @PatchMapping("/api/notificaciones/{id}/leida")
    public Notificacion marcarLeida(@PathVariable("id") String id) {
        return notificador.marcarLeida(id);
    }
}
