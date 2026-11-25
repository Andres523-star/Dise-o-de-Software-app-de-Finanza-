package com.misfinanzas.model;

import java.time.LocalDate;

/** Frecuencia de un cobro recurrente. Cada valor sabe calcular la siguiente fecha (Experto en Información). */
public enum Frecuencia {
    SEMANAL,
    QUINCENAL,
    MENSUAL,
    ANUAL;

    public LocalDate siguienteFecha(LocalDate desde) {
        return switch (this) {
            case SEMANAL -> desde.plusWeeks(1);
            case QUINCENAL -> desde.plusDays(15);
            case MENSUAL -> desde.plusMonths(1);
            case ANUAL -> desde.plusYears(1);
        };
    }
}
