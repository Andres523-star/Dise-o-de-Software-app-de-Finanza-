package com.misfinanzas.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Respuestas.TransaccionResponse;
import com.misfinanzas.dto.Solicitudes.RegistrarTransaccion;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.exception.ReglaNegocioException;
import com.misfinanzas.model.Categoria;
import com.misfinanzas.model.Cuenta;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.model.Transaccion;
import com.misfinanzas.model.TransaccionFactory;
import com.misfinanzas.repository.TransaccionRepository;

/**
 * Equivale a saveTransaction() de la PWA (frontend/transactions.js), pero en capas:
 *   1. valida que el tablero, la cuenta y la categoría existan,
 *   2. crea la transacción con la Fábrica,
 *   3. la aplica a la cuenta (polimorfismo: Ingreso suma, Egreso resta, Ahorro valida y resta),
 *   4. guarda en MongoDB (equivale a guardarEnFirebase),
 *   5. verifica el umbral del presupuesto (alertas 80/90/100).
 */
@Service
public class GestorTransacciones implements IGestorTransacciones {

    private final TransaccionRepository transacciones;
    private final IGestorTableros tableros;
    private final IGestorCuentas cuentas;
    private final IGestorCategorias categorias;
    private final IGestorPresupuestos presupuestos;

    public GestorTransacciones(TransaccionRepository transacciones, IGestorTableros tableros,
                               IGestorCuentas cuentas, IGestorCategorias categorias,
                               IGestorPresupuestos presupuestos) {
        this.transacciones = transacciones;
        this.tableros = tableros;
        this.cuentas = cuentas;
        this.categorias = categorias;
        this.presupuestos = presupuestos;
    }

    @Override
    public TransaccionResponse registrar(String tableroId, RegistrarTransaccion s) {
        tableros.buscar(tableroId);
        validarCategoria(tableroId, s.categoriaId(), s.tipo());
        Transaccion t = TransaccionFactory.crear(s.tipo(), tableroId, s.cuentaId(), s.categoriaId(),
                s.monto(), s.fecha(), descripcion(s), s.detalle());
        return registrar(t);
    }

    @Override
    public TransaccionResponse registrar(Transaccion t) {
        Cuenta cuenta = cuentas.buscar(t.getTableroId(), t.getCuentaId());
        t.aplicar(cuenta);
        cuentas.guardar(cuenta);
        Transaccion guardada = transacciones.save(t);
        presupuestos.verificarUmbral(t.getTableroId(), t.getCategoriaId(), t.getFecha());
        return TransaccionResponse.de(guardada, cuenta.getSaldo());
    }

    /** Editar = deshacer la transacción vieja y aplicar la nueva (los saldos quedan exactos). */
    @Override
    public TransaccionResponse editar(String id, RegistrarTransaccion s) {
        Transaccion vieja = buscar(id);
        String tableroId = vieja.getTableroId();
        validarCategoria(tableroId, s.categoriaId(), s.tipo());

        Cuenta cuentaVieja = cuentas.buscar(tableroId, vieja.getCuentaId());
        vieja.revertir(cuentaVieja);
        cuentas.guardar(cuentaVieja);

        Transaccion nueva = TransaccionFactory.crear(s.tipo(), tableroId, s.cuentaId(), s.categoriaId(),
                s.monto(), s.fecha() != null ? s.fecha() : vieja.getFecha(), descripcion(s), s.detalle());
        nueva.setId(id);
        Cuenta cuentaNueva = cuentas.buscar(tableroId, nueva.getCuentaId());
        try {
            nueva.aplicar(cuentaNueva);
        } catch (ReglaNegocioException e) {
            vieja.aplicar(cuentaVieja); // si la edición no es válida, se deja todo como estaba
            cuentas.guardar(cuentaVieja);
            throw e;
        }
        cuentas.guardar(cuentaNueva);
        Transaccion guardada = transacciones.save(nueva);

        presupuestos.verificarUmbral(tableroId, vieja.getCategoriaId(), vieja.getFecha());
        presupuestos.verificarUmbral(tableroId, nueva.getCategoriaId(), nueva.getFecha());
        return TransaccionResponse.de(guardada, cuentaNueva.getSaldo());
    }

    @Override
    public void eliminar(String id) {
        Transaccion t = buscar(id);
        Cuenta cuenta = cuentas.buscar(t.getTableroId(), t.getCuentaId());
        t.revertir(cuenta);
        cuentas.guardar(cuenta);
        transacciones.deleteById(id);
        presupuestos.verificarUmbral(t.getTableroId(), t.getCategoriaId(), t.getFecha());
    }

    @Override
    public TransaccionResponse obtener(String id) {
        Transaccion t = buscar(id);
        return TransaccionResponse.de(t, cuentas.buscar(t.getTableroId(), t.getCuentaId()).getSaldo());
    }

    @Override
    public List<TransaccionResponse> listar(String tableroId, TipoTransaccion tipo, Integer mes, Integer anio) {
        tableros.buscar(tableroId);
        List<Transaccion> lista;
        if (mes != null && anio != null) {
            LocalDate desde = LocalDate.of(anio, mes, 1);
            lista = transacciones.buscarEntreFechas(tableroId, desde,
                    desde.withDayOfMonth(desde.lengthOfMonth()));
        } else {
            lista = transacciones.findByTableroIdOrderByFechaDesc(tableroId);
        }
        return lista.stream()
                .filter(t -> tipo == null || t.getTipo() == tipo)
                .map(t -> TransaccionResponse.de(t, saldoSeguro(t)))
                .toList();
    }

    private Transaccion buscar(String id) {
        return transacciones.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Transacción", id));
    }

    private void validarCategoria(String tableroId, String categoriaId, TipoTransaccion tipo) {
        Categoria categoria = categorias.buscar(tableroId, categoriaId);
        if (categoria.getTipo() != tipo) {
            throw new ReglaNegocioException("La categoría '" + categoria.getNombre() + "' es de tipo "
                    + categoria.getTipo() + " y la transacción es " + tipo);
        }
    }

    /** Igual que la PWA: si no hay descripción se usa "Transacción" (el nombre de la categoría lo pone el cliente). */
    private static String descripcion(RegistrarTransaccion s) {
        return s.descripcion() == null || s.descripcion().isBlank() ? "Transacción" : s.descripcion().trim();
    }

    private double saldoSeguro(Transaccion t) {
        try {
            return cuentas.buscar(t.getTableroId(), t.getCuentaId()).getSaldo();
        } catch (RecursoNoEncontradoException e) {
            return 0;
        }
    }
}
