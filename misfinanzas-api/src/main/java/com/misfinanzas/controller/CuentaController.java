package com.misfinanzas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Solicitudes.CrearCuenta;
import com.misfinanzas.model.Cuenta;
import com.misfinanzas.service.IGestorCuentas;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tableros/{tableroId}/cuentas")
public class CuentaController {

    private final IGestorCuentas gestor;

    public CuentaController(IGestorCuentas gestor) {
        this.gestor = gestor;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cuenta crear(@PathVariable("tableroId") String tableroId, @Valid @RequestBody CrearCuenta solicitud) {
        return gestor.crear(tableroId, solicitud);
    }

    @GetMapping
    public List<Cuenta> listar(@PathVariable("tableroId") String tableroId) {
        return gestor.listar(tableroId);
    }
}
