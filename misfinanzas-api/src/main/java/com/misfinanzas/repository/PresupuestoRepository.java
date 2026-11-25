package com.misfinanzas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.misfinanzas.model.Presupuesto;

/** IPresupuestoRepository del diagrama 2. */
public interface PresupuestoRepository extends MongoRepository<Presupuesto, String> {

    List<Presupuesto> findByTableroIdAndMesAndAnio(String tableroId, int mes, int anio);

    Optional<Presupuesto> findByTableroIdAndCategoriaIdAndMesAndAnio(String tableroId, String categoriaId, int mes, int anio);

    void deleteByTableroId(String tableroId);
}
