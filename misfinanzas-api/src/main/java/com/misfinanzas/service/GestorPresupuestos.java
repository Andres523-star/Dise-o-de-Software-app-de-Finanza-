package com.misfinanzas.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Respuestas.PresupuestoResponse;
import com.misfinanzas.dto.Solicitudes.CrearPresupuesto;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.exception.ReglaNegocioException;
import com.misfinanzas.model.Categoria;
import com.misfinanzas.model.Presupuesto;
import com.misfinanzas.model.TipoNotificacion;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.model.Transaccion;
import com.misfinanzas.repository.PresupuestoRepository;
import com.misfinanzas.repository.TransaccionRepository;

@Service
public class GestorPresupuestos implements IGestorPresupuestos {

    private final PresupuestoRepository presupuestos;
    private final TransaccionRepository transacciones;
    private final IGestorTableros tableros;
    private final IGestorCategorias categorias;
    private final INotificador notificador;

    public GestorPresupuestos(PresupuestoRepository presupuestos, TransaccionRepository transacciones,
                              IGestorTableros tableros, IGestorCategorias categorias, INotificador notificador) {
        this.presupuestos = presupuestos;
        this.transacciones = transacciones;
        this.tableros = tableros;
        this.categorias = categorias;
        this.notificador = notificador;
    }

    @Override
    public PresupuestoResponse crear(String tableroId, CrearPresupuesto s) {
        tableros.buscar(tableroId);
        Categoria categoria = categorias.buscar(tableroId, s.categoriaId());
        if (categoria.getTipo() != TipoTransaccion.EGRESO) {
            throw new ReglaNegocioException("Solo se pueden poner presupuestos a categorías de gasto");
        }
        presupuestos.findByTableroIdAndCategoriaIdAndMesAndAnio(tableroId, s.categoriaId(), s.mes(), s.anio())
                .ifPresent(p -> {
                    throw new ReglaNegocioException("Ya existe un presupuesto para " + categoria.getNombre()
                            + " en " + s.mes() + "/" + s.anio());
                });

        Presupuesto p = new Presupuesto(tableroId, s.categoriaId(), s.mes(), s.anio(), s.limite());
        p.setGastado(gastadoEnElMes(tableroId, s.categoriaId(), s.mes(), s.anio()));
        enviarAlertas(p, categoria);
        return PresupuestoResponse.de(presupuestos.save(p));
    }

    @Override
    public List<PresupuestoResponse> listar(String tableroId, int mes, int anio) {
        tableros.buscar(tableroId);
        return presupuestos.findByTableroIdAndMesAndAnio(tableroId, mes, anio).stream()
                .map(PresupuestoResponse::de)
                .toList();
    }

    @Override
    public PresupuestoResponse obtener(String id) {
        return PresupuestoResponse.de(presupuestos.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Presupuesto", id)));
    }

    @Override
    public void verificarUmbral(String tableroId, String categoriaId, LocalDate fecha) {
        presupuestos.findByTableroIdAndCategoriaIdAndMesAndAnio(tableroId, categoriaId,
                fecha.getMonthValue(), fecha.getYear()).ifPresent(p -> {
            p.setGastado(gastadoEnElMes(tableroId, categoriaId, p.getMes(), p.getAnio()));
            enviarAlertas(p, categorias.buscar(tableroId, categoriaId));
            presupuestos.save(p);
        });
    }

    private void enviarAlertas(Presupuesto p, Categoria categoria) {
        for (int umbral : p.evaluarUmbral()) {
            TipoNotificacion tipo = switch (umbral) {
                case 80 -> TipoNotificacion.PRESUPUESTO_80;
                case 90 -> TipoNotificacion.PRESUPUESTO_90;
                default -> TipoNotificacion.PRESUPUESTO_100;
            };
            String titulo = umbral >= 100 ? "🚨 Límite alcanzado" : "⚠️ Presupuesto al " + umbral + "%";
            String mensaje = "Llevas " + p.porcentajeConsumido() + "% del presupuesto de "
                    + categoria.getIcono() + " " + categoria.getNombre() + " este mes.";
            notificador.notificar(p.getTableroId(), tipo, titulo, mensaje);
        }
    }

    private double gastadoEnElMes(String tableroId, String categoriaId, int mes, int anio) {
        LocalDate desde = LocalDate.of(anio, mes, 1);
        LocalDate hasta = desde.withDayOfMonth(desde.lengthOfMonth());
        return transacciones.buscarPorCategoriaEntreFechas(tableroId, categoriaId, desde, hasta)
                .stream()
                .filter(t -> t.getTipo() == TipoTransaccion.EGRESO)
                .mapToDouble(Transaccion::getMonto)
                .sum();
    }
}
