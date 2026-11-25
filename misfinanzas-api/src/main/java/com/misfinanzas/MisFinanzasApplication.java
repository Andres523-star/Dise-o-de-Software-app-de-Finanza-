package com.misfinanzas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la API de Mis Finanzas.
 *
 * Implementación representativa en Java del diseño (diagramas 2, 3 y 4):
 *   controller  -> Capa de Presentación (Controllers)
 *   service     -> Capa de Negocio (Services, con interfaces IGestor...)
 *   repository  -> Capa de Datos (Repositories sobre MongoDB)
 *   adapter     -> Adaptadores externos (TRM y notificaciones push)
 *   model       -> Clases del diagrama de clases (vista lógica)
 */
@SpringBootApplication
public class MisFinanzasApplication {

    public static void main(String[] args) {
        SpringApplication.run(MisFinanzasApplication.class, args);
    }
}
