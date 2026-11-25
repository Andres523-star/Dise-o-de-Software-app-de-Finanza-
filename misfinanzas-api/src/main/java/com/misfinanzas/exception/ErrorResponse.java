package com.misfinanzas.exception;

import java.time.LocalDateTime;
import java.util.List;

/** Cuerpo JSON de todas las respuestas de error. */
public record ErrorResponse(int codigo, String error, String mensaje, List<String> detalles, LocalDateTime fecha) {

    public static ErrorResponse de(int codigo, String error, String mensaje) {
        return new ErrorResponse(codigo, error, mensaje, List.of(), LocalDateTime.now());
    }

    public static ErrorResponse de(int codigo, String error, String mensaje, List<String> detalles) {
        return new ErrorResponse(codigo, error, mensaje, detalles, LocalDateTime.now());
    }
}
