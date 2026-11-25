package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.dto.Solicitudes.CrearCategoria;
import com.misfinanzas.dto.Solicitudes.EditarCategoria;
import com.misfinanzas.model.Categoria;

/** Categorías personalizables (HU-09). */
public interface IGestorCategorias {

    Categoria crear(String tableroId, CrearCategoria solicitud);

    List<Categoria> listar(String tableroId, String buscar);

    Categoria editar(String id, EditarCategoria solicitud);

    void eliminar(String id);

    /** Devuelve la categoría si existe y pertenece al tablero; si no, 404. */
    Categoria buscar(String tableroId, String categoriaId);
}
