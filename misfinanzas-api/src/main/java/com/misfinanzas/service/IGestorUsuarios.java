package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.dto.Solicitudes.CrearUsuario;
import com.misfinanzas.model.Usuario;

public interface IGestorUsuarios {

    Usuario registrar(CrearUsuario solicitud);

    Usuario obtener(String id);

    Usuario buscarPorEmail(String email);

    List<Usuario> listar();
}
