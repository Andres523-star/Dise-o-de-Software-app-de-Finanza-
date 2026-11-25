package com.misfinanzas.exception;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Convierte las excepciones en respuestas HTTP claras.
 * Así los controllers no repiten try/catch (Alta Cohesión).
 */
@RestControllerAdvice
public class ManejadorGlobalErrores {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> noEncontrado(RecursoNoEncontradoException e) {
        return responder(HttpStatus.NOT_FOUND, e.getMessage(), List.of());
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponse> reglaNegocio(ReglaNegocioException e) {
        return responder(HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage(), List.of());
    }

    @ExceptionHandler(ServicioExternoException.class)
    public ResponseEntity<ErrorResponse> servicioExterno(ServicioExternoException e) {
        return responder(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage(), List.of());
    }

    /** Falla una validación del cuerpo (ej.: monto <= 0, campo obligatorio vacío). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException e) {
        List<String> detalles = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .toList();
        return responder(HttpStatus.BAD_REQUEST, "Datos inválidos", detalles);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> jsonMalFormado(HttpMessageNotReadableException e) {
        return responder(HttpStatus.BAD_REQUEST, "El JSON enviado está mal formado o tiene un valor no permitido", List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> tipoInvalido(MethodArgumentTypeMismatchException e) {
        return responder(HttpStatus.BAD_REQUEST, "Valor no válido para el parámetro '" + e.getName() + "'", List.of());
    }

    private ResponseEntity<ErrorResponse> responder(HttpStatus estado, String mensaje, List<String> detalles) {
        return ResponseEntity.status(estado)
                .body(ErrorResponse.de(estado.value(), estado.getReasonPhrase(), mensaje, detalles));
    }
}
