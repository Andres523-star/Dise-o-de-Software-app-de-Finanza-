package com.misfinanzas.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Respuestas.PresupuestoResponse;
import com.misfinanzas.dto.Solicitudes.CrearPresupuesto;
import com.misfinanzas.service.IGestorPresupuestos;

import jakarta.validation.Valid;

/** PresupuestoController del diagrama 2. */
@RestController
public class PresupuestoController {

    private final IGestorPresupuestos gestor;

    public PresupuestoController(IGestorPresupuestos gestor) {
        this.gestor = gestor;
    }

    @PostMapping("/api/tableros/{tableroId}/presupuestos")
    @ResponseStatus(HttpStatus.CREATED)
    public PresupuestoResponse crear(@PathVariable("tableroId") String tableroId, @Valid @RequestBody CrearPresupuesto solicitud) {
        return gestor.crear(tableroId, solicitud);
    }

    /** Presupuestos del mes (por defecto el mes actual) con su porcentaje consumido. */
    @GetMapping("/api/tableros/{tableroId}/presupuestos")
    public List<PresupuestoResponse> listar(@PathVariable("tableroId") String tableroId,
                                            @RequestParam(name = "mes", required = false) Integer mes,
                                            @RequestParam(name = "anio", required = false) Integer anio) {
        LocalDate hoy = LocalDate.now();
        return gestor.listar(tableroId, mes != null ? mes : hoy.getMonthValue(), anio != null ? anio : hoy.getYear());
    }

    @GetMapping("/api/presupuestos/{id}")
    public PresupuestoResponse obtener(@PathVariable("id") String id) {
        return gestor.obtener(id);
    }
}
