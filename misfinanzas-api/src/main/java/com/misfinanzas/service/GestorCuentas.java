package com.misfinanzas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Solicitudes.CrearCuenta;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.model.Cuenta;
import com.misfinanzas.repository.CuentaRepository;

@Service
public class GestorCuentas implements IGestorCuentas {

    private final CuentaRepository cuentas;
    private final IGestorTableros tableros;

    public GestorCuentas(CuentaRepository cuentas, IGestorTableros tableros) {
        this.cuentas = cuentas;
        this.tableros = tableros;
    }

    @Override
    public Cuenta crear(String tableroId, CrearCuenta s) {
        tableros.buscar(tableroId);
        return cuentas.save(new Cuenta(tableroId, s.nombre().trim(), s.tipo(), s.color(), s.saldoInicial()));
    }

    @Override
    public List<Cuenta> listar(String tableroId) {
        tableros.buscar(tableroId);
        return cuentas.findByTableroId(tableroId);
    }

    @Override
    public Cuenta buscar(String tableroId, String cuentaId) {
        return cuentas.findById(cuentaId)
                .filter(c -> c.getTableroId().equals(tableroId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Cuenta", cuentaId));
    }

    @Override
    public Cuenta guardar(Cuenta cuenta) {
        return cuentas.save(cuenta);
    }
}
