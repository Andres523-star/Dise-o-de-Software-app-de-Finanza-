package com.misfinanzas.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.Notificacion;

public interface NotificacionRepository extends MongoRepository<Notificacion, String> {

    List<Notificacion> findByTableroIdOrderByFechaDesc(String tableroId);

    void deleteByTableroId(String tableroId);
}
