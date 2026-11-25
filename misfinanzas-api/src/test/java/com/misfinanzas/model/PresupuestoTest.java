package com.misfinanzas.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

/** Pruebas de las alertas de presupuesto al 80 %, 90 % y 100 % (HU-10, HU-11). */
class PresupuestoTest {

    private Presupuesto comida(double gastado) {
        Presupuesto p = new Presupuesto("t1", "cat-comida", 11, 2026, 400_000);
        p.setGastado(gastado);
        return p;
    }

    @Test
    void calculaElPorcentajeConsumido() {
        assertEquals(38.3, comida(153_000).porcentajeConsumido());
    }

    @Test
    void noHayAlertaPorDebajoDel80() {
        assertTrue(comida(300_000).evaluarUmbral().isEmpty());
    }

    @Test
    void alertaAl80PorCiento() {
        assertEquals(List.of(80), comida(320_000).evaluarUmbral());
    }

    @Test
    void cadaAlertaSaleUnaSolaVez() {
        Presupuesto p = comida(320_000);
        assertEquals(List.of(80), p.evaluarUmbral());
        assertTrue(p.evaluarUmbral().isEmpty(), "La alerta del 80 % no se repite");
    }

    @Test
    void siSePasaDeGolpeSalenTodasLasAlertasPendientes() {
        assertEquals(List.of(80, 90, 100), comida(450_000).evaluarUmbral());
    }

    @Test
    void disponibleEsLimiteMenosGastado() {
        assertEquals(250_000, comida(150_000).disponible());
    }
}
