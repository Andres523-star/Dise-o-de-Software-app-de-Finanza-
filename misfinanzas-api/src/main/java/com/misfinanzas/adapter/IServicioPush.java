package com.misfinanzas.adapter;

/** Interfaz del diagrama 2 para enviar notificaciones push al celular. */
public interface IServicioPush {

    void enviar(String tableroId, String titulo, String mensaje);
}
