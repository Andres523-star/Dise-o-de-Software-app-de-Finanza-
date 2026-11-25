package com.misfinanzas.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.misfinanzas.exception.ReglaNegocioException;

/** Pruebas del polimorfismo de Transaccion (HU-05, HU-06, HU-08). */
class TransaccionTest {

    private Cuenta cuentaCon(double saldo) {
        return new Cuenta("t1", "Nu", TipoCuenta.BANCO, "#8A05BE", saldo);
    }

    @Test
    void ingresoSumaAlSaldo() {
        Cuenta nu = cuentaCon(100_000);
        new Ingreso("t1", "c1", "cat", 50_000, LocalDate.now(), "Venta", "Cliente").aplicar(nu);
        assertEquals(150_000, nu.getSaldo());
    }

    @Test
    void egresoRestaDelSaldoYPuedeQuedarNegativo() {
        Cuenta nu = cuentaCon(20_000);
        new Egreso("t1", "c1", "cat", 25_000, LocalDate.now(), "Mercado", "D1").aplicar(nu);
        assertEquals(-5_000, nu.getSaldo());
    }

    @Test
    void ahorroNoPermiteApartarMasDeLoQueHay() {
        Cuenta nu = cuentaCon(10_000);
        Ahorro ahorro = new Ahorro("t1", "c1", "cat", 50_000, LocalDate.now(), "Ahorro", null);
        assertThrows(ReglaNegocioException.class, () -> ahorro.aplicar(nu));
        assertEquals(10_000, nu.getSaldo(), "El saldo no debe cambiar si el ahorro se rechaza");
    }

    @Test
    void revertirDejaElSaldoComoEstaba() {
        Cuenta nu = cuentaCon(100_000);
        Egreso gasto = new Egreso("t1", "c1", "cat", 30_000, LocalDate.now(), "Cine", "Cine");
        gasto.aplicar(nu);
        gasto.revertir(nu);
        assertEquals(100_000, nu.getSaldo());
    }

    @Test
    void laFabricaCreaLaSubclaseCorrecta() {
        assertInstanceOf(Ingreso.class, TransaccionFactory.crear(TipoTransaccion.INGRESO, "t", "c", "k", 1, null, "x", null));
        assertInstanceOf(Egreso.class, TransaccionFactory.crear(TipoTransaccion.EGRESO, "t", "c", "k", 1, null, "x", null));
        assertInstanceOf(Ahorro.class, TransaccionFactory.crear(TipoTransaccion.AHORRO, "t", "c", "k", 1, null, "x", null));
    }

    @Test
    void laFabricaUsaLaFechaDeHoySiNoLlega() {
        Transaccion t = TransaccionFactory.crear(TipoTransaccion.EGRESO, "t", "c", "k", 1, null, "x", null);
        assertEquals(LocalDate.now(), t.getFecha());
    }
}
