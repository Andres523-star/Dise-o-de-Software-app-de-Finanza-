package com.misfinanzas.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.Categoria;

public interface CategoriaRepository extends MongoRepository<Categoria, String> {

    List<Categoria> findByTableroId(String tableroId);

    List<Categoria> findByTableroIdAndNombreContainingIgnoreCase(String tableroId, String texto);

    void deleteByTableroId(String tableroId);
}
