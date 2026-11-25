package com.misfinanzas.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Respuestas.ConversionResponse;
import com.misfinanzas.service.IAnalistaDivisas;

/** DivisasController del diagrama 2 (TRM). */
@RestController
@RequestMapping("/api/divisas")
public class DivisasController {

    private final IAnalistaDivisas analista;

    public DivisasController(IAnalistaDivisas analista) {
        this.analista = analista;
    }

    /** Convierte un monto: /api/divisas/convertir?monto=100&de=USD&a=COP */
    @GetMapping("/convertir")
    public ConversionResponse convertir(@RequestParam("monto") double monto, @RequestParam("de") String de, @RequestParam("a") String a) {
        return analista.convertir(monto, de, a);
    }

    /** Tasas de cambio con base en una moneda: /api/divisas/USD */
    @GetMapping("/{base}")
    public Map<String, Double> tasas(@PathVariable("base") String base) {
        return analista.tasas(base);
    }
}
