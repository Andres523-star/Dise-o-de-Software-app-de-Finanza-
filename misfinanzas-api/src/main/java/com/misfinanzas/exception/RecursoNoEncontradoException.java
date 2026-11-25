package com.misfinanzas.exception;

/** El tablero, cuenta, categoría u otro recurso pedido no existe. Responde 404. */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String recurso, String id) {
        super("No se encontró " + recurso + ": " + id);
    }
}
