package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.ApoyoDTO;
import iunex.com.ar.backend.model.Apoyo;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.Propuesta;
import iunex.com.ar.backend.repository.ApoyoRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.PropuestaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApoyoService {

    @Autowired
    private ApoyoRepository apoyoRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private PropuestaRepository propuestaRepository;

    public Apoyo guardarApoyo(ApoyoDTO dto) {
        if (dto == null) {
            throw new RuntimeException("Los datos del apoyo son obligatorios.");
        }

        if (dto.getCiudadanoId() == null) {
            throw new RuntimeException("El ciudadano es obligatorio.");
        }

        if (dto.getPropuestaId() == null) {
            throw new RuntimeException("La propuesta es obligatoria.");
        }

        if (apoyoRepository.existsByCiudadanoIdAndPropuestaId(dto.getCiudadanoId(), dto.getPropuestaId())) {
            throw new RuntimeException("El ciudadano ya apoyo esta propuesta.");
        }

        Ciudadano ciudadano = ciudadanoRepository.findById(dto.getCiudadanoId())
                .orElseThrow(() -> new RuntimeException("El ciudadano seleccionado no existe."));

        Propuesta propuesta = propuestaRepository.findById(dto.getPropuestaId())
                .orElseThrow(() -> new RuntimeException("La propuesta seleccionada no existe."));

        Apoyo apoyo = new Apoyo();
        apoyo.setCiudadano(ciudadano);
        apoyo.setPropuesta(propuesta);

        return apoyoRepository.save(apoyo);
    }

    public List<Apoyo> obtenerTodos() {
        return apoyoRepository.findAll();
    }
}
