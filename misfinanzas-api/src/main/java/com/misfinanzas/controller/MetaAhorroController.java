package com.misfinanzas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Respuestas.MetaResponse;
import com.misfinanzas.dto.Solicitudes.Abonar;
import com.misfinanzas.dto.Solicitudes.CrearMeta;
import com.misfinanzas.service.IGestorMetas;

import jakarta.validation.Valid;

@RestController
public class MetaAhorroController {

    private final IGestorMetas gestor;

    public MetaAhorroController(IGestorMetas gestor) {
        this.gestor = gestor;
    }

    @PostMapping("/api/tableros/{tableroId}/metas")
    @ResponseStatus(HttpStatus.CREATED)
    public MetaResponse crear(@PathVariable("tableroId") String tableroId, @Valid @RequestBody CrearMeta solicitud) {
        return gestor.crear(tableroId, solicitud);
    }

    @GetMapping("/api/tableros/{tableroId}/metas")
    public List<MetaResponse> listar(@PathVariable("tableroId") String tableroId) {
        return gestor.listar(tableroId);
    }

    @PostMapping("/api/metas/{id}/abonos")
    public MetaResponse abonar(@PathVariable("id") String id, @Valid @RequestBody Abonar solicitud) {
        return gestor.abonar(id, solicitud);
    }
}
