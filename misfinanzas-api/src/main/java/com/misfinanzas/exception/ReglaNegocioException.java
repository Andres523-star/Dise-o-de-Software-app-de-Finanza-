package com.misfinanzas.exception;

/** Se viola una regla de negocio (ej.: no hay saldo suficiente). Responde 422. */
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
