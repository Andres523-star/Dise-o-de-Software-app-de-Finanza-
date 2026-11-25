package com.misfinanzas.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.Tablero;

/** ITableroRepository del diagrama 2. Spring Data genera la implementación sobre MongoDB. */
public interface TableroRepository extends MongoRepository<Tablero, String> {

    List<Tablero> findByMiembrosUsuarioId(String usuarioId);
}
