package com.misfinanzas.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.misfinanzas.exception.ReglaNegocioException;

/** Pruebas de metas de ahorro (HU-12, HU-13), cobros recurrentes (HU-14) y tableros (HU-04, HU-07). */
class MetaYCobroTest {

    @Test
    void abonarPasaDineroDeLaCuentaALaMeta() {
        Cuenta nu = new Cuenta("t1", "Nu", TipoCuenta.BANCO, null, 1_000_000);
        MetaAhorro viaje = new MetaAhorro("t1", "Viaje", 2_000_000, null);
        viaje.abonar(500_000, nu);
        assertEquals(500_000, nu.getSaldo());
        assertEquals(500_000, viaje.getMontoActual());
        assertEquals(25.0, viaje.porcentaje());
        assertEquals(1_500_000, viaje.faltante());
        assertEquals(1, viaje.getAbonos().size());
    }

    @Test
    void noSePuedeAbonarSinSaldo() {
        Cuenta nu = new Cuenta("t1", "Nu", TipoCuenta.BANCO, null, 100);
        MetaAhorro viaje = new MetaAhorro("t1", "Viaje", 2_000_000, null);
        assertThrows(ReglaNegocioException.class, () -> viaje.abonar(500_000, nu));
        assertEquals(0, viaje.getMontoActual());
    }

    @Test
    void laMetaSeCompletaAlLlegarAlObjetivo() {
        Cuenta nu = new Cuenta("t1", "Nu", TipoCuenta.BANCO, null, 3_000_000);
        MetaAhorro moto = new MetaAhorro("t1", "Moto", 1_000_000, null);
        moto.abonar(1_000_000, nu);
        assertTrue(moto.completada());
        assertEquals(100.0, moto.porcentaje());
    }

    @Test
    void elCobroGeneraUnEgresoYMueveLaFecha() {
        LocalDate hoy = LocalDate.of(2026, 11, 25);
        CobroRecurrente netflix = new CobroRecurrente("t1", "cta-nu", "cat-ocio", "Netflix", 44_900,
                Frecuencia.MENSUAL, hoy, false);
        Transaccion t = netflix.generarTransaccion();
        assertInstanceOf(Egreso.class, t);
        assertEquals(44_900, t.getMonto());
        assertEquals(hoy, t.getFecha());
        assertEquals(LocalDate.of(2026, 12, 25), netflix.getProximaFecha());
    }

    @Test
    void elSalarioQuincenalGeneraUnIngreso() {
        CobroRecurrente salario = new CobroRecurrente("t1", "cta-nu", "cat-salario", "Salario", 1_500_000,
                Frecuencia.QUINCENAL, LocalDate.of(2026, 11, 15), true);
        assertInstanceOf(Ingreso.class, salario.generarTransaccion());
        assertEquals(LocalDate.of(2026, 11, 30), salario.getProximaFecha());
    }

    @Test
    void elBalanceDelTableroSumaTodasLasCuentas() {
        Tablero t = new Tablero("Mis finanzas", TipoTablero.PERSONAL, "COP", "u1");
        double balance = t.calcularBalance(java.util.List.of(
                new Cuenta("t1", "Nu", TipoCuenta.BANCO, null, 1_000),
                new Cuenta("t1", "Nequi", TipoCuenta.BILLETERA_DIGITAL, null, 500)));
        assertEquals(1_500, balance);
    }

    @Test
    void invitarAgregaUnMiembroUnaSolaVez() {
        Tablero t = new Tablero("Casa", TipoTablero.PERSONAL, "COP", "u1");
        Usuario laura = new Usuario("Laura", "laura@ejemplo.com", "correo");
        laura.setId("u2");
        t.invitar(laura, RolTablero.EDITOR);
        assertTrue(t.esMiembro("u2"));
        assertThrows(ReglaNegocioException.class, () -> t.invitar(laura, RolTablero.LECTOR));
        assertFalse(t.esMiembro("u3"));
    }
}
