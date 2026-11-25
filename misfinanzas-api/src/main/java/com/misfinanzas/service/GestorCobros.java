package com.misfinanzas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Respuestas.TransaccionResponse;
import com.misfinanzas.dto.Solicitudes.CrearCobro;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.exception.ReglaNegocioException;
import com.misfinanzas.model.Categoria;
import com.misfinanzas.model.CobroRecurrente;
import com.misfinanzas.model.TipoNotificacion;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.model.Transaccion;
import com.misfinanzas.repository.CobroRecurrenteRepository;

@Service
public class GestorCobros implements IGestorCobros {

    private final CobroRecurrenteRepository cobros;
    private final IGestorTableros tableros;
    private final IGestorCuentas cuentas;
    private final IGestorCategorias categorias;
    private final IGestorTransacciones transacciones;
    private final INotificador notificador;

    public GestorCobros(CobroRecurrenteRepository cobros, IGestorTableros tableros, IGestorCuentas cuentas,
                        IGestorCategorias categorias, IGestorTransacciones transacciones, INotificador notificador) {
        this.cobros = cobros;
        this.tableros = tableros;
        this.cuentas = cuentas;
        this.categorias = categorias;
        this.transacciones = transacciones;
        this.notificador = notificador;
    }

    @Override
    public CobroRecurrente crear(String tableroId, CrearCobro s) {
        tableros.buscar(tableroId);
        cuentas.buscar(tableroId, s.cuentaId());
        Categoria categoria = categorias.buscar(tableroId, s.categoriaId());
        TipoTransaccion esperado = s.esIngreso() ? TipoTransaccion.INGRESO : TipoTransaccion.EGRESO;
        if (categoria.getTipo() != esperado) {
            throw new ReglaNegocioException("La categoría '" + categoria.getNombre() + "' es de tipo "
                    + categoria.getTipo() + " y el cobro es " + esperado);
        }
        return cobros.save(new CobroRecurrente(tableroId, s.cuentaId(), s.categoriaId(), s.nombre().trim(),
                s.monto(), s.frecuencia(), s.proximaFecha(), s.esIngreso()));
    }

    @Override
    public List<CobroRecurrente> listar(String tableroId) {
        tableros.buscar(tableroId);
        return cobros.findByTableroIdOrderByProximaFechaAsc(tableroId);
    }

    @Override
    public TransaccionResponse generar(String cobroId) {
        CobroRecurrente cobro = cobros.findById(cobroId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cobro recurrente", cobroId));

        Transaccion t = cobro.generarTransaccion();   // patrón Creador
        TransaccionResponse respuesta = transacciones.registrar(t);
        cobros.save(cobro);

        notificador.notificar(cobro.getTableroId(), TipoNotificacion.COBRO_RECURRENTE,
                "🔁 Cobro registrado: " + cobro.getNombre(),
                "Se registró " + cobro.getNombre() + " por $" + (long) cobro.getMonto()
                        + ". Próximo cobro: " + cobro.getProximaFecha());
        return respuesta;
    }
}
