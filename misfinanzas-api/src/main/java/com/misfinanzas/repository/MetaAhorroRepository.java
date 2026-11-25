package com.misfinanzas.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.MetaAhorro;

public interface MetaAhorroRepository extends MongoRepository<MetaAhorro, String> {

    List<MetaAhorro> findByTableroId(String tableroId);

    void deleteByTableroId(String tableroId);
}
