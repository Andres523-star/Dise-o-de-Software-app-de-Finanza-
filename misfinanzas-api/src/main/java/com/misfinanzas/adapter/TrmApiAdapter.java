package com.misfinanzas.adapter;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.misfinanzas.exception.ReglaNegocioException;
import com.misfinanzas.exception.ServicioExternoException;

/**
 * Patrón Adaptador: traduce la respuesta de la API pública open.er-api.com (la misma que usa la PWA
 * en currency.js) al formato que entiende el negocio: un Map moneda -> tasa.
 *
 * Si la API no responde, usa las últimas tasas guardadas (igual que la PWA con localStorage).
 */
@Component
public class TrmApiAdapter implements IProveedorDivisas {

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper json = new ObjectMapper();
    private final Map<String, Map<String, Double>> ultimasTasas = new ConcurrentHashMap<>();
    private final String urlBase;

    public TrmApiAdapter(@Value("${misfinanzas.divisas.url}") String urlBase) {
        this.urlBase = urlBase;
    }

    @Override
    public Map<String, Double> obtenerTasas(String monedaBase) {
        String base = monedaBase.trim().toUpperCase();
        JsonNode cuerpo;
        try {
            HttpRequest peticion = HttpRequest.newBuilder(URI.create(urlBase + base))
                    .timeout(Duration.ofSeconds(8)).GET().build();
            HttpResponse<String> respuesta = http.send(peticion, HttpResponse.BodyHandlers.ofString());
            cuerpo = json.readTree(respuesta.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return usarGuardadas(base);
        } catch (Exception e) {
            return usarGuardadas(base);
        }

        if (!"success".equals(cuerpo.path("result").asText())) {
            // La API responde 200 pero con "result": "error" cuando la moneda no existe
            throw new ReglaNegocioException("La moneda '" + base + "' no es soportada por la API de divisas ("
                    + cuerpo.path("error-type").asText("error") + ")");
        }

        Map<String, Double> tasas = new HashMap<>();
        for (Map.Entry<String, JsonNode> campo : cuerpo.path("rates").properties()) {
            tasas.put(campo.getKey(), campo.getValue().asDouble());
        }
        ultimasTasas.put(base, tasas);
        return tasas;
    }

    private Map<String, Double> usarGuardadas(String base) {
        Map<String, Double> guardadas = ultimasTasas.get(base);
        if (guardadas == null) {
            throw new ServicioExternoException("La API de divisas no respondió y no hay tasas guardadas para " + base);
        }
        return guardadas;
    }
}
