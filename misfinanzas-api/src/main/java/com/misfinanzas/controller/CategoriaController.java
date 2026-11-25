package com.misfinanzas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Solicitudes.CrearCategoria;
import com.misfinanzas.dto.Solicitudes.EditarCategoria;
import com.misfinanzas.model.Categoria;
import com.misfinanzas.service.IGestorCategorias;

import jakarta.validation.Valid;

@RestController
public class CategoriaController {

    private final IGestorCategorias gestor;

    public CategoriaController(IGestorCategorias gestor) {
        this.gestor = gestor;
    }

    @PostMapping("/api/tableros/{tableroId}/categorias")
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria crear(@PathVariable("tableroId") String tableroId, @Valid @RequestBody CrearCategoria solicitud) {
        return gestor.crear(tableroId, solicitud);
    }

    /** Lista las categorías; con ?buscar=com filtra por nombre. */
    @GetMapping("/api/tableros/{tableroId}/categorias")
    public List<Categoria> listar(@PathVariable("tableroId") String tableroId, @RequestParam(name = "buscar", required = false) String buscar) {
        return gestor.listar(tableroId, buscar);
    }

    @PatchMapping("/api/categorias/{id}")
    public Categoria editar(@PathVariable("id") String id, @RequestBody EditarCategoria solicitud) {
        return gestor.editar(id, solicitud);
    }

    @DeleteMapping("/api/categorias/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") String id) {
        gestor.eliminar(id);
    }
}
