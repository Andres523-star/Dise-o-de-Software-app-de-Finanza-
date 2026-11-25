package com.misfinanzas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Solicitudes.CrearCategoria;
import com.misfinanzas.dto.Solicitudes.EditarCategoria;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.exception.ReglaNegocioException;
import com.misfinanzas.model.Categoria;
import com.misfinanzas.repository.CategoriaRepository;
import com.misfinanzas.repository.TransaccionRepository;

@Service
public class GestorCategorias implements IGestorCategorias {

    private final CategoriaRepository categorias;
    private final TransaccionRepository transacciones;
    private final IGestorTableros tableros;

    public GestorCategorias(CategoriaRepository categorias, TransaccionRepository transacciones,
                            IGestorTableros tableros) {
        this.categorias = categorias;
        this.transacciones = transacciones;
        this.tableros = tableros;
    }

    @Override
    public Categoria crear(String tableroId, CrearCategoria s) {
        tableros.buscar(tableroId);
        String icono = s.icono() == null || s.icono().isBlank() ? "📌" : s.icono();
        return categorias.save(new Categoria(tableroId, s.nombre().trim(), icono, s.color(), s.tipo()));
    }

    @Override
    public List<Categoria> listar(String tableroId, String buscar) {
        tableros.buscar(tableroId);
        if (buscar == null || buscar.isBlank()) {
            return categorias.findByTableroId(tableroId);
        }
        return categorias.findByTableroIdAndNombreContainingIgnoreCase(tableroId, buscar.trim());
    }

    @Override
    public Categoria editar(String id, EditarCategoria s) {
        Categoria c = categorias.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Categoría", id));
        if (s.nombre() != null && !s.nombre().isBlank()) {
            c.setNombre(s.nombre().trim());
        }
        if (s.icono() != null && !s.icono().isBlank()) {
            c.setIcono(s.icono());
        }
        if (s.color() != null && !s.color().isBlank()) {
            c.setColor(s.color());
        }
        return categorias.save(c);
    }

    @Override
    public void eliminar(String id) {
        if (!categorias.existsById(id)) {
            throw new RecursoNoEncontradoException("Categoría", id);
        }
        if (transacciones.existsByCategoriaId(id)) {
            throw new ReglaNegocioException("No se puede eliminar la categoría porque tiene transacciones registradas");
        }
        categorias.deleteById(id);
    }

    @Override
    public Categoria buscar(String tableroId, String categoriaId) {
        return categorias.findById(categoriaId)
                .filter(c -> c.getTableroId().equals(tableroId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", categoriaId));
    }
}
