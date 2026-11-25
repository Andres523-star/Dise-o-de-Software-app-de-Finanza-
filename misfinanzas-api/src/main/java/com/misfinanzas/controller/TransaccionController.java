package com.misfinanzas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Respuestas.TransaccionResponse;
import com.misfinanzas.dto.Solicitudes.RegistrarTransaccion;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.service.IGestorTransacciones;

import jakarta.validation.Valid;

/** TransaccionController del diagrama 2: registrar ingresos, gastos y ahorros. */
@RestController
public class TransaccionController {

    private final IGestorTransacciones gestor;

    public TransaccionController(IGestorTransacciones gestor) {
        this.gestor = gestor;
    }

    // 📌 PRESENTACION 06 ¿DÓNDE LLEGA LA PETICIÓN AL BACKEND? (Controller)
    @PostMapping("/api/tableros/{tableroId}/transacciones")
    @ResponseStatus(HttpStatus.CREATED)
    public TransaccionResponse registrar(@PathVariable("tableroId") String tableroId,
                                         @Valid @RequestBody RegistrarTransaccion solicitud) {
        return gestor.registrar(tableroId, solicitud);
    }

    /** Filtros opcionales: ?tipo=EGRESO&mes=11&anio=2026 */
    @GetMapping("/api/tableros/{tableroId}/transacciones")
    public List<TransaccionResponse> listar(@PathVariable("tableroId") String tableroId,
                                            @RequestParam(name = "tipo", required = false) TipoTransaccion tipo,
                                            @RequestParam(name = "mes", required = false) Integer mes,
                                            @RequestParam(name = "anio", required = false) Integer anio) {
        return gestor.listar(tableroId, tipo, mes, anio);
    }

    @GetMapping("/api/transacciones/{id}")
    public TransaccionResponse obtener(@PathVariable("id") String id) {
        return gestor.obtener(id);
    }

    @PutMapping("/api/transacciones/{id}")
    public TransaccionResponse editar(@PathVariable("id") String id, @Valid @RequestBody RegistrarTransaccion solicitud) {
        return gestor.editar(id, solicitud);
    }

    @DeleteMapping("/api/transacciones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") String id) {
        gestor.eliminar(id);
    }
}
