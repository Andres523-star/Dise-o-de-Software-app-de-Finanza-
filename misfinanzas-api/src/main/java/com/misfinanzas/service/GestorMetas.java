package com.misfinanzas.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.misfinanzas.dto.Respuestas.MetaResponse;
import com.misfinanzas.dto.Solicitudes.Abonar;
import com.misfinanzas.dto.Solicitudes.CrearMeta;
import com.misfinanzas.exception.RecursoNoEncontradoException;
import com.misfinanzas.model.Cuenta;
import com.misfinanzas.model.MetaAhorro;
import com.misfinanzas.model.TipoNotificacion;
import com.misfinanzas.repository.MetaAhorroRepository;

@Service
public class GestorMetas implements IGestorMetas {

    private final MetaAhorroRepository metas;
    private final IGestorTableros tableros;
    private final IGestorCuentas cuentas;
    private final INotificador notificador;

    public GestorMetas(MetaAhorroRepository metas, IGestorTableros tableros, IGestorCuentas cuentas,
                       INotificador notificador) {
        this.metas = metas;
        this.tableros = tableros;
        this.cuentas = cuentas;
        this.notificador = notificador;
    }

    @Override
    public MetaResponse crear(String tableroId, CrearMeta s) {
        tableros.buscar(tableroId);
        return MetaResponse.de(metas.save(new MetaAhorro(tableroId, s.nombre().trim(), s.montoObjetivo(), s.fechaLimite())));
    }

    @Override
    public List<MetaResponse> listar(String tableroId) {
        tableros.buscar(tableroId);
        return metas.findByTableroId(tableroId).stream().map(MetaResponse::de).toList();
    }

    @Override
    public MetaResponse abonar(String metaId, Abonar s) {
        MetaAhorro meta = metas.findById(metaId).orElseThrow(() -> new RecursoNoEncontradoException("Meta", metaId));
        Cuenta origen = cuentas.buscar(meta.getTableroId(), s.cuentaId());

        meta.abonar(s.monto(), origen);   // la meta y la cuenta aplican sus propias reglas
        cuentas.guardar(origen);
        metas.save(meta);

        if (meta.completada()) {
            notificador.notificar(meta.getTableroId(), TipoNotificacion.META_COMPLETADA,
                    "🎉 ¡Meta cumplida!", "Completaste tu meta '" + meta.getNombre() + "'.");
        }
        return MetaResponse.de(meta);
    }
}
