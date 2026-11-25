package com.misfinanzas.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}
