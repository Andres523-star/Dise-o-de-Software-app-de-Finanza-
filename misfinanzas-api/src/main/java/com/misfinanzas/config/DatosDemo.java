package com.misfinanzas.config;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.misfinanzas.dto.Solicitudes.CrearPresupuesto;
import com.misfinanzas.model.Categoria;
import com.misfinanzas.model.CobroRecurrente;
import com.misfinanzas.model.Cuenta;
import com.misfinanzas.model.Egreso;
import com.misfinanzas.model.Frecuencia;
import com.misfinanzas.model.Ingreso;
import com.misfinanzas.model.MetaAhorro;
import com.misfinanzas.model.Tablero;
import com.misfinanzas.model.TipoCuenta;
import com.misfinanzas.model.TipoTablero;
import com.misfinanzas.model.TipoTransaccion;
import com.misfinanzas.model.Usuario;
import com.misfinanzas.repository.CategoriaRepository;
import com.misfinanzas.repository.CobroRecurrenteRepository;
import com.misfinanzas.repository.CuentaRepository;
import com.misfinanzas.repository.MetaAhorroRepository;
import com.misfinanzas.repository.TableroRepository;
import com.misfinanzas.repository.UsuarioRepository;
import com.misfinanzas.service.IGestorPresupuestos;
import com.misfinanzas.service.IGestorTransacciones;

/**
 * Carga datos de demostración la primera vez que arranca la API (si la base está vacía),
 * con ids fijos para que la colección de Postman funcione sin cambiar nada.
 */
@Component
public class DatosDemo implements CommandLineRunner {

    public static final String USUARIO = "usr-andres";
    public static final String TABLERO = "tablero-demo";

    private static final Logger log = LoggerFactory.getLogger(DatosDemo.class);

    private final UsuarioRepository usuarios;
    private final TableroRepository tableros;
    private final CuentaRepository cuentas;
    private final CategoriaRepository categorias;
    private final MetaAhorroRepository metas;
    private final CobroRecurrenteRepository cobros;
    private final IGestorTransacciones transacciones;
    private final IGestorPresupuestos presupuestos;

    public DatosDemo(UsuarioRepository usuarios, TableroRepository tableros, CuentaRepository cuentas,
                     CategoriaRepository categorias, MetaAhorroRepository metas, CobroRecurrenteRepository cobros,
                     IGestorTransacciones transacciones, IGestorPresupuestos presupuestos) {
        this.usuarios = usuarios;
        this.tableros = tableros;
        this.cuentas = cuentas;
        this.categorias = categorias;
        this.metas = metas;
        this.cobros = cobros;
        this.transacciones = transacciones;
        this.presupuestos = presupuestos;
    }

    @Override
    public void run(String... args) {
        if (tableros.existsById(TABLERO)) {
            return;
        }
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);

        Usuario andres = new Usuario("Andrés Cabrera", "andres.cabrerabol@gmail.com", "google");
        andres.setId(USUARIO);
        usuarios.save(andres);
        Usuario invitada = new Usuario("Laura Gómez", "laura@ejemplo.com", "correo");
        invitada.setId("usr-laura");
        usuarios.save(invitada);

        Tablero tablero = new Tablero("Mis finanzas", TipoTablero.PERSONAL, "COP", USUARIO);
        tablero.setId(TABLERO);
        tableros.save(tablero);

        cuenta("cta-nu", "Nu", TipoCuenta.BANCO, "#8A05BE");
        cuenta("cta-nequi", "Nequi", TipoCuenta.BILLETERA_DIGITAL, "#E6007E");
        cuenta("cta-efectivo", "Efectivo", TipoCuenta.EFECTIVO, "#34C759");

        categoria("cat-salario", "Salario", "💼", TipoTransaccion.INGRESO);
        categoria("cat-comida", "Comida", "🍕", TipoTransaccion.EGRESO);
        categoria("cat-transporte", "Transporte", "🚌", TipoTransaccion.EGRESO);
        categoria("cat-ocio", "Entretenimiento", "🎮", TipoTransaccion.EGRESO);
        categoria("cat-ahorro", "Ahorro", "💎", TipoTransaccion.AHORRO);

        // Movimientos del mes actual (se aplican con el gestor para que los saldos queden correctos)
        transacciones.registrar(new Ingreso(TABLERO, "cta-nu", "cat-salario", 3_000_000, inicioMes, "Salario", "Empresa"));
        transacciones.registrar(new Ingreso(TABLERO, "cta-nequi", "cat-salario", 400_000, inicioMes, "Venta", "Cliente"));
        transacciones.registrar(new Egreso(TABLERO, "cta-nu", "cat-comida", 115_000, inicioMes.plusDays(1), "Mercado D1", "D1"));
        transacciones.registrar(new Egreso(TABLERO, "cta-nu", "cat-comida", 38_000, inicioMes.plusDays(2), "Hamburguesa", "El Corral"));
        transacciones.registrar(new Egreso(TABLERO, "cta-nequi", "cat-transporte", 60_000, inicioMes.plusDays(3), "Recarga MIO", "MIO"));
        transacciones.registrar(new Egreso(TABLERO, "cta-nequi", "cat-ocio", 52_000, inicioMes.plusDays(4), "Partido de fútbol", "Cancha"));

        // Presupuesto de comida: 400.000. Ya lleva 153.000 (38 %).
        presupuestos.crear(TABLERO, new CrearPresupuesto("cat-comida", hoy.getMonthValue(), hoy.getYear(), 400_000.0));

        MetaAhorro viaje = new MetaAhorro(TABLERO, "Viaje a Cartagena", 2_000_000, hoy.plusMonths(6));
        viaje.setId("meta-viaje");
        metas.save(viaje);

        CobroRecurrente netflix = new CobroRecurrente(TABLERO, "cta-nu", "cat-ocio", "Netflix", 44_900,
                Frecuencia.MENSUAL, hoy.plusDays(5), false);
        netflix.setId("cobro-netflix");
        cobros.save(netflix);

        log.info("Datos de demostración cargados: tablero '{}' con 3 cuentas, 5 categorías y 6 movimientos", TABLERO);
    }

    private void cuenta(String id, String nombre, TipoCuenta tipo, String color) {
        Cuenta c = new Cuenta(TABLERO, nombre, tipo, color, 0);
        c.setId(id);
        cuentas.save(c);
    }

    private void categoria(String id, String nombre, String icono, TipoTransaccion tipo) {
        Categoria c = new Categoria(TABLERO, nombre, icono, null, tipo);
        c.setId(id);
        categorias.save(c);
    }
}
