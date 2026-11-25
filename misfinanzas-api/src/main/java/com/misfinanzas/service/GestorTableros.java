package com.misfinanzas.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Respuestas.ResumenMes;
import com.misfinanzas.dto.Respuestas.TableroResponse;
import com.misfinanzas.dto.Solicitudes.CrearTablero;
import com.misfinanzas.dto.Solicitudes.InvitarMiembro;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.model.Tablero;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.model.Transaccion;
import com.misfinanzas.model.Usuario;
import com.misfinanzas.repository.CategoriaRepository;
import com.misfinanzas.repository.CobroRecurrenteRepository;
import com.misfinanzas.repository.CuentaRepository;
import com.misfinanzas.repository.MetaAhorroRepository;
import com.misfinanzas.repository.NotificacionRepository;
import com.misfinanzas.repository.PresupuestoRepository;
import com.misfinanzas.repository.TableroRepository;
import com.misfinanzas.repository.TransaccionRepository;

@Service
public class GestorTableros implements IGestorTableros {

    private final TableroRepository tableros;
    private final CuentaRepository cuentas;
    private final CategoriaRepository categorias;
    private final TransaccionRepository transacciones;
    private final PresupuestoRepository presupuestos;
    private final MetaAhorroRepository metas;
    private final CobroRecurrenteRepository cobros;
    private final NotificacionRepository notificaciones;
    private final IGestorUsuarios usuarios;

    public GestorTableros(TableroRepository tableros, CuentaRepository cuentas, CategoriaRepository categorias,
                          TransaccionRepository transacciones, PresupuestoRepository presupuestos,
                          MetaAhorroRepository metas, CobroRecurrenteRepository cobros,
                          NotificacionRepository notificaciones, IGestorUsuarios usuarios) {
        this.tableros = tableros;
        this.cuentas = cuentas;
        this.categorias = categorias;
        this.transacciones = transacciones;
        this.presupuestos = presupuestos;
        this.metas = metas;
        this.cobros = cobros;
        this.notificaciones = notificaciones;
        this.usuarios = usuarios;
    }

    @Override
    public TableroResponse crear(CrearTablero s) {
        usuarios.obtener(s.propietarioId()); // el propietario debe existir
        String moneda = s.moneda() == null || s.moneda().isBlank() ? "COP" : s.moneda().trim().toUpperCase();
        Tablero t = tableros.save(new Tablero(s.nombre().trim(), s.tipo(), moneda, s.propietarioId()));
        return TableroResponse.de(t, 0);
    }

    @Override
    public TableroResponse obtener(String id) {
        Tablero t = buscar(id);
        return TableroResponse.de(t, t.calcularBalance(cuentas.findByTableroId(id)));
    }

    @Override
    public List<TableroResponse> listarPorUsuario(String usuarioId) {
        List<Tablero> lista = usuarioId == null || usuarioId.isBlank()
                ? tableros.findAll()
                : tableros.findByMiembrosUsuarioId(usuarioId);
        return lista.stream()
                .map(t -> TableroResponse.de(t, t.calcularBalance(cuentas.findByTableroId(t.getId()))))
                .toList();
    }

    @Override
    public TableroResponse renombrar(String id, String nombre) {
        Tablero t = buscar(id);
        t.setNombre(nombre.trim());
        tableros.save(t);
        return obtener(id);
    }

    /** Al borrar el tablero se borran sus partes (composición en el diagrama de clases). */
    @Override
    public void eliminar(String id) {
        buscar(id);
        transacciones.deleteByTableroId(id);
        presupuestos.deleteByTableroId(id);
        metas.deleteByTableroId(id);
        cobros.deleteByTableroId(id);
        notificaciones.deleteByTableroId(id);
        categorias.deleteByTableroId(id);
        cuentas.deleteByTableroId(id);
        tableros.deleteById(id);
    }

    @Override
    public TableroResponse invitar(String id, InvitarMiembro s) {
        Tablero t = buscar(id);
        Usuario invitado = usuarios.buscarPorEmail(s.email());
        t.invitar(invitado, s.rol());
        tableros.save(t);
        return obtener(id);
    }

    @Override
    public ResumenMes resumen(String id, int mes, int anio) {
        Tablero t = buscar(id);
        LocalDate desde = LocalDate.of(anio, mes, 1);
        LocalDate hasta = desde.withDayOfMonth(desde.lengthOfMonth());
        List<Transaccion> movimientos = transacciones.buscarEntreFechas(id, desde, hasta);

        double ingresos = sumar(movimientos, TipoTransaccion.INGRESO);
        double egresos = sumar(movimientos, TipoTransaccion.EGRESO);
        double ahorro = sumar(movimientos, TipoTransaccion.AHORRO);
        double saldoTotal = t.calcularBalance(cuentas.findByTableroId(id));

        return new ResumenMes(id, mes, anio, ingresos, egresos, ahorro, ingresos - egresos - ahorro,
                saldoTotal, movimientos.size());
    }

    @Override
    public Tablero buscar(String id) {
        return tableros.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Tablero", id));
    }

    private static double sumar(List<Transaccion> movimientos, TipoTransaccion tipo) {
        return movimientos.stream().filter(m -> m.getTipo() == tipo).mapToDouble(Transaccion::getMonto).sum();
    }
}
