package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.ObservacionDTO;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.EstadoObservacion;
import iunex.com.ar.backend.model.Observacion;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.ObservacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObservacionService {

    @Autowired
    private ObservacionRepository observacionRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private BarrioRepository barrioRepository;

    public Observacion guardarObservacion(ObservacionDTO dto) {
        if (dto == null) {
            throw new RuntimeException("Los datos de la observacion son obligatorios.");
        }

        if (dto.getCiudadanoId() == null) {
            throw new RuntimeException("El ciudadano es obligatorio.");
        }

        if (dto.getBarrioId() == null) {
            throw new RuntimeException("El barrio es obligatorio.");
        }

        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new RuntimeException("El titulo de la observacion es obligatorio.");
        }

        if (dto.getDescripcion() == null || dto.getDescripcion().isBlank()) {
            throw new RuntimeException("La descripcion de la observacion es obligatoria.");
        }

        Ciudadano ciudadano = ciudadanoRepository.findById(dto.getCiudadanoId())
                .orElseThrow(() -> new RuntimeException("El ciudadano seleccionado no existe."));

        Barrio barrio = barrioRepository.findById(dto.getBarrioId())
                .orElseThrow(() -> new RuntimeException("El barrio seleccionado no existe."));

        Observacion observacion = new Observacion();
        observacion.setCiudadano(ciudadano);
        observacion.setBarrio(barrio);
        observacion.setTitulo(dto.getTitulo().trim());
        observacion.setDescripcion(dto.getDescripcion().trim());
        observacion.setEstado(dto.getEstado() != null ? dto.getEstado() : EstadoObservacion.PENDIENTE);

        return observacionRepository.save(observacion);
    }

    public List<Observacion> obtenerTodas() {
        return observacionRepository.findAll();
    }
}
