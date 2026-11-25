package com.misfinanzas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Solicitudes.CrearUsuario;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.exception.ReglaNegocioException;
import com.misfinanzas.model.Usuario;
import com.misfinanzas.repository.UsuarioRepository;

@Service
public class GestorUsuarios implements IGestorUsuarios {

    private final UsuarioRepository usuarios;

    public GestorUsuarios(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public Usuario registrar(CrearUsuario s) {
        String email = s.email().trim().toLowerCase();
        if (usuarios.existsByEmail(email)) {
            throw new ReglaNegocioException("Ya existe un usuario con el correo " + email);
        }
        String proveedor = s.proveedorAuth() == null || s.proveedorAuth().isBlank() ? "correo" : s.proveedorAuth();
        return usuarios.save(new Usuario(s.nombre().trim(), email, proveedor));
    }

    @Override
    public Usuario obtener(String id) {
        return usuarios.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
    }

    @Override
    public Usuario buscarPorEmail(String email) {
        String limpio = email.trim().toLowerCase();
        return usuarios.findByEmail(limpio).orElseThrow(() -> new RecursoNoEncontradoException("Usuario con correo", limpio));
    }

    @Override
    public List<Usuario> listar() {
        return usuarios.findAll();
    }
}
