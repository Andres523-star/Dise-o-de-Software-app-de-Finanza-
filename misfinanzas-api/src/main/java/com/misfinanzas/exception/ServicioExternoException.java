package com.misfinanzas.exception;

/** Un servicio externo (API de divisas) no respondió y no hay datos guardados. Responde 503. */
public class ServicioExternoException extends RuntimeException {
    public ServicioExternoException(String mensaje) {
        super(mensaje);
    }
}
