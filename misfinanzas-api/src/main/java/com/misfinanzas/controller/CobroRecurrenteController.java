package com.misfinanzas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Respuestas.TransaccionResponse;
import com.misfinanzas.dto.Solicitudes.CrearCobro;
import com.misfinanzas.model.CobroRecurrente;
import com.misfinanzas.service.IGestorCobros;

import jakarta.validation.Valid;

@RestController
public class CobroRecurrenteController {

    private final IGestorCobros gestor;

    public CobroRecurrenteController(IGestorCobros gestor) {
        this.gestor = gestor;
    }

    @PostMapping("/api/tableros/{tableroId}/cobros")
    @ResponseStatus(HttpStatus.CREATED)
    public CobroRecurrente crear(@PathVariable("tableroId") String tableroId, @Valid @RequestBody CrearCobro solicitud) {
        return gestor.crear(tableroId, solicitud);
    }

    @GetMapping("/api/tableros/{tableroId}/cobros")
    public List<CobroRecurrente> listar(@PathVariable("tableroId") String tableroId) {
        return gestor.listar(tableroId);
    }

    /** Registra el cobro del periodo como transacción y mueve la próxima fecha. */
    @PostMapping("/api/cobros/{id}/generar")
    @ResponseStatus(HttpStatus.CREATED)
    public TransaccionResponse generar(@PathVariable("id") String id) {
        return gestor.generar(id);
    }
}
