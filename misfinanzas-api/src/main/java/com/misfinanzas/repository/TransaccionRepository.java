package com.misfinanzas.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.misfinanzas.model.Transaccion;

/** ITransaccionRepository del diagrama 2. Devuelve Ingreso, Egreso o Ahorro según lo guardado. */
public interface TransaccionRepository extends MongoRepository<Transaccion, String> {

    List<Transaccion> findByTableroIdOrderByFechaDesc(String tableroId);

    /** Movimientos de un rango de fechas, incluyendo el primer y el último día. */
    @Query(value = "{ 'tableroId': ?0, 'fecha': { $gte: ?1, $lte: ?2 } }", sort = "{ 'fecha': -1 }")
    List<Transaccion> buscarEntreFechas(String tableroId, LocalDate desde, LocalDate hasta);

    @Query("{ 'tableroId': ?0, 'categoriaId': ?1, 'fecha': { $gte: ?2, $lte: ?3 } }")
    List<Transaccion> buscarPorCategoriaEntreFechas(String tableroId, String categoriaId, LocalDate desde, LocalDate hasta);

    boolean existsByCategoriaId(String categoriaId);

    void deleteByTableroId(String tableroId);
}
