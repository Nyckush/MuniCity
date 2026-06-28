package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.PropuestaDTO;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.EstadoPropuesta;
import iunex.com.ar.backend.model.Propuesta;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.PropuestaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropuestaService {

    @Autowired
    private PropuestaRepository propuestaRepository;

    @Autowired
    private CentroVecinalRepository centroVecinalRepository;

    public Propuesta guardarPropuesta(PropuestaDTO dto) {
        if (dto == null) {
            throw new RuntimeException("Los datos de la propuesta son obligatorios.");
        }

        if (dto.getCentroVecinalId() == null) {
            throw new RuntimeException("El centro vecinal es obligatorio.");
        }

        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new RuntimeException("El titulo de la propuesta es obligatorio.");
        }

        if (dto.getDescripcion() == null || dto.getDescripcion().isBlank()) {
            throw new RuntimeException("La descripcion de la propuesta es obligatoria.");
        }

        if (dto.getCategoria() == null) {
            throw new RuntimeException("La categoria de la propuesta es obligatoria.");
        }

        CentroVecinal centroVecinal = centroVecinalRepository.findById(dto.getCentroVecinalId())
                .orElseThrow(() -> new RuntimeException("El centro vecinal seleccionado no existe."));

        Propuesta propuesta = new Propuesta();
        propuesta.setCentroVecinal(centroVecinal);
        propuesta.setTitulo(dto.getTitulo().trim());
        propuesta.setDescripcion(dto.getDescripcion().trim());
        propuesta.setCategoria(dto.getCategoria());
        propuesta.setEstado(dto.getEstado() != null ? dto.getEstado() : EstadoPropuesta.BORRADOR);

        return propuestaRepository.save(propuesta);
    }

    public List<Propuesta> obtenerTodas() {
        return propuestaRepository.findAll();
    }
}
