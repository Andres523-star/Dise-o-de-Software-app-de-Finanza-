package com.misfinanzas.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Adaptador de Firebase Cloud Messaging.
 *
 * En esta implementación representativa el envío real lo hace la Cloud Function de la PWA
 * (functions/index.js, sendEachForMulticast). Aquí se deja registrado en el log para poder
 * ver en la consola cuándo saldría el push, sin depender de credenciales de Firebase.
 */
@Component
public class FcmAdapter implements IServicioPush {

    private static final Logger log = LoggerFactory.getLogger(FcmAdapter.class);

    @Override
    public void enviar(String tableroId, String titulo, String mensaje) {
        log.info("[PUSH FCM] tablero={} | {} - {}", tableroId, titulo, mensaje);
    }
}
