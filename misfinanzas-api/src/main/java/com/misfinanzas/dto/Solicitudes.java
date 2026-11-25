package com.misfinanzas.dto;

import java.time.LocalDate;

import com.misfinanzas.model.Frecuencia;
import com.misfinanzas.model.RolTablero;
import com.misfinanzas.model.TipoCuenta;
import com.misfinanzas.model.TipoTablero;
import com.misfinanzas.model.TipoTransaccion;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

/** Cuerpos JSON que recibe la API, con sus validaciones. */
public final class Solicitudes {

    private Solicitudes() {
    }

    public record CrearUsuario(
            @NotBlank(message = "El nombre es obligatorio") String nombre,
            @NotBlank(message = "El correo es obligatorio") @Email(message = "El correo no es válido") String email,
            String proveedorAuth) {
    }

    public record CrearTablero(
            @NotBlank(message = "El nombre del tablero es obligatorio") String nombre,
            @NotNull(message = "El tipo es obligatorio (PERSONAL o NEGOCIO)") TipoTablero tipo,
            String moneda,
            @NotBlank(message = "El propietarioId es obligatorio") String propietarioId) {
    }

    public record RenombrarTablero(@NotBlank(message = "El nombre es obligatorio") String nombre) {
    }

    public record InvitarMiembro(
            @NotBlank(message = "El correo es obligatorio") @Email(message = "El correo no es válido") String email,
            @NotNull(message = "El rol es obligatorio (EDITOR o LECTOR)") RolTablero rol) {
    }

    public record CrearCuenta(
            @NotBlank(message = "El nombre de la cuenta es obligatorio") String nombre,
            @NotNull(message = "El tipo es obligatorio (EFECTIVO, BILLETERA_DIGITAL o BANCO)") TipoCuenta tipo,
            String color,
            @PositiveOrZero(message = "El saldo inicial no puede ser negativo") double saldoInicial) {
    }

    public record CrearCategoria(
            @NotBlank(message = "El nombre de la categoría es obligatorio") String nombre,
            String icono,
            String color,
            @NotNull(message = "El tipo es obligatorio (INGRESO, EGRESO o AHORRO)") TipoTransaccion tipo) {
    }

    public record EditarCategoria(String nombre, String icono, String color) {
    }

    /** Registrar o editar un ingreso, gasto o ahorro. */
    public record RegistrarTransaccion(
            @NotNull(message = "El tipo es obligatorio (INGRESO, EGRESO o AHORRO)") TipoTransaccion tipo,
            @NotNull(message = "El monto es obligatorio") @Positive(message = "El monto debe ser mayor a cero") Double monto,
            @NotBlank(message = "La cuenta es obligatoria") String cuentaId,
            @NotBlank(message = "La categoría es obligatoria") String categoriaId,
            LocalDate fecha,
            String descripcion,
            String detalle) {
    }

    public record CrearPresupuesto(
            @NotBlank(message = "La categoría es obligatoria") String categoriaId,
            @Min(value = 1, message = "El mes va de 1 a 12") @Max(value = 12, message = "El mes va de 1 a 12") int mes,
            @Min(value = 2000, message = "Año no válido") int anio,
            @NotNull(message = "El límite es obligatorio") @Positive(message = "El límite debe ser mayor a cero") Double limite) {
    }

    public record CrearMeta(
            @NotBlank(message = "El nombre de la meta es obligatorio") String nombre,
            @NotNull(message = "El monto objetivo es obligatorio") @Positive(message = "El monto objetivo debe ser mayor a cero") Double montoObjetivo,
            LocalDate fechaLimite) {
    }

    public record Abonar(
            @NotNull(message = "El monto es obligatorio") @Positive(message = "El monto debe ser mayor a cero") Double monto,
            @NotBlank(message = "La cuenta de origen es obligatoria") String cuentaId) {
    }

    public record CrearCobro(
            @NotBlank(message = "El nombre es obligatorio") String nombre,
            @NotNull(message = "El monto es obligatorio") @Positive(message = "El monto debe ser mayor a cero") Double monto,
            @NotNull(message = "La frecuencia es obligatoria (SEMANAL, QUINCENAL, MENSUAL o ANUAL)") Frecuencia frecuencia,
            @NotNull(message = "La próxima fecha es obligatoria") LocalDate proximaFecha,
            @NotBlank(message = "La cuenta es obligatoria") String cuentaId,
            @NotBlank(message = "La categoría es obligatoria") String categoriaId,
            boolean esIngreso) {
    }
}
