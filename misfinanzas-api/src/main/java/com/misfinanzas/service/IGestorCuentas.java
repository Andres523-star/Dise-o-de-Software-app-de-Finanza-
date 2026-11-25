package com.misfinanzas.service;

import java.util.List;

import com.misfinanzas.dto.Solicitudes.CrearCuenta;
import com.misfinanzas.model.Cuenta;

/** Cuentas del tablero (HU-07). */
public interface IGestorCuentas {

    Cuenta crear(String tableroId, CrearCuenta solicitud);

    List<Cuenta> listar(String tableroId);

    /** Devuelve la cuenta si existe y pertenece al tablero; si no, 404. */
    Cuenta buscar(String tableroId, String cuentaId);

    Cuenta guardar(Cuenta cuenta);
}
