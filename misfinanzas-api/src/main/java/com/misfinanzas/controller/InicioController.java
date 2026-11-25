package com.misfinanzas.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Página de inicio de la API. AWS Elastic Beanstalk revisa esta ruta para saber si la
 * aplicación está viva, y sirve para comprobar rápido en el navegador que el despliegue funcionó.
 */
@RestController
public class InicioController {

    @GetMapping("/api")
    public Map<String, Object> inicio() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("aplicacion", "Mis Finanzas API");
        info.put("estado", "OK");
        info.put("documentacion", "/swagger-ui.html");
        info.put("ejemploTablero", "/api/tableros/tablero-demo");
        return info;
    }
}
