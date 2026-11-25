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

import com.misfinanzas.dto.Solicitudes.CrearUsuario;
import com.misfinanzas.model.Usuario;
import com.misfinanzas.service.IGestorUsuarios;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final IGestorUsuarios gestor;

    public UsuarioController(IGestorUsuarios gestor) {
        this.gestor = gestor;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario registrar(@Valid @RequestBody CrearUsuario solicitud) {
        return gestor.registrar(solicitud);
    }

    @GetMapping
    public List<Usuario> listar() {
        return gestor.listar();
    }

    @GetMapping("/{id}")
    public Usuario obtener(@PathVariable("id") String id) {
        return gestor.obtener(id);
    }
}
