package com.misfinanzas.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.Cuenta;

/** ICuentaRepository del diagrama 2. */
public interface CuentaRepository extends MongoRepository<Cuenta, String> {

    List<Cuenta> findByTableroId(String tableroId);

    void deleteByTableroId(String tableroId);
}
