package com.misfinanzas.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.misfinanzas.dto.Respuestas.ResumenMes;
import com.misfinanzas.dto.Respuestas.TableroResponse;
import com.misfinanzas.dto.Solicitudes.CrearTablero;
import com.misfinanzas.dto.Solicitudes.InvitarMiembro;
import com.misfinanzas.dto.Solicitudes.RenombrarTablero;
import com.misfinanzas.service.IGestorTableros;

import jakarta.validation.Valid;

/** Patrón Controlador (GRASP): recibe la petición HTTP y la delega al gestor; no tiene lógica de negocio. */
@RestController
@RequestMapping("/api/tableros")
public class TableroController {

    private final IGestorTableros gestor;

    public TableroController(IGestorTableros gestor) {
        this.gestor = gestor;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TableroResponse crear(@Valid @RequestBody CrearTablero solicitud) {
        return gestor.crear(solicitud);
    }

    @GetMapping
    public List<TableroResponse> listar(@RequestParam(name = "usuarioId", required = false) String usuarioId) {
        return gestor.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public TableroResponse obtener(@PathVariable("id") String id) {
        return gestor.obtener(id);
    }

    @PatchMapping("/{id}")
    public TableroResponse renombrar(@PathVariable("id") String id, @Valid @RequestBody RenombrarTablero solicitud) {
        return gestor.renombrar(id, solicitud.nombre());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") String id) {
        gestor.eliminar(id);
    }

    @PostMapping("/{id}/miembros")
    public TableroResponse invitar(@PathVariable("id") String id, @Valid @RequestBody InvitarMiembro solicitud) {
        return gestor.invitar(id, solicitud);
    }

    /** Resumen del mes: ingresos, gastos, ahorro y balance. Sin parámetros usa el mes actual. */
    @GetMapping("/{id}/resumen")
    public ResumenMes resumen(@PathVariable("id") String id,
                              @RequestParam(name = "mes", required = false) Integer mes,
                              @RequestParam(name = "anio", required = false) Integer anio) {
        LocalDate hoy = LocalDate.now();
        return gestor.resumen(id, mes != null ? mes : hoy.getMonthValue(), anio != null ? anio : hoy.getYear());
    }
}
