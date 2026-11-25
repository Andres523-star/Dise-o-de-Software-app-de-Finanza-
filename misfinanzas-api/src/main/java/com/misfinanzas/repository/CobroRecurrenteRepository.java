package com.misfinanzas.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.CobroRecurrente;

public interface CobroRecurrenteRepository extends MongoRepository<CobroRecurrente, String> {

    List<CobroRecurrente> findByTableroIdOrderByProximaFechaAsc(String tableroId);

    void deleteByTableroId(String tableroId);
}
