package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.CentroVecinalDTO;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CentroVecinalService {

    @Autowired
    private CentroVecinalRepository centroVecinalRepository;

    @Autowired
    private BarrioRepository barrioRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    public CentroVecinal guardarCentroVecinal(CentroVecinalDTO dto) {
        if (dto == null) {
            throw new RuntimeException("Los datos del centro vecinal son obligatorios.");
        }

        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new RuntimeException("El nombre del centro vecinal es obligatorio.");
        }

        if (dto.getBarrioId() == null) {
            throw new RuntimeException("El barrio es obligatorio.");
        }

        if (dto.getPresidenteCiudadanoId() == null) {
            throw new RuntimeException("El presidente ciudadano es obligatorio.");
        }

        String nombreFormateado = dto.getNombre().trim().toUpperCase();
        if (centroVecinalRepository.existsByNombre(nombreFormateado)) {
            throw new RuntimeException("El centro vecinal '" + nombreFormateado + "' ya existe.");
        }

        if (centroVecinalRepository.existsByBarrioId(dto.getBarrioId())) {
            throw new RuntimeException("El barrio seleccionado ya tiene un centro vecinal asignado.");
        }

        if (centroVecinalRepository.existsByPresidenteId(dto.getPresidenteCiudadanoId())) {
            throw new RuntimeException("El ciudadano seleccionado ya preside otro centro vecinal.");
        }

        Barrio barrio = barrioRepository.findById(dto.getBarrioId())
                .orElseThrow(() -> new RuntimeException("El barrio seleccionado no existe."));

        Ciudadano presidente = ciudadanoRepository.findById(dto.getPresidenteCiudadanoId())
                .orElseThrow(() -> new RuntimeException("El ciudadano presidente no existe."));

        CentroVecinal centroVecinal = new CentroVecinal();
        centroVecinal.setNombre(nombreFormateado);
        centroVecinal.setBarrio(barrio);
        centroVecinal.setPresidente(presidente);

        return centroVecinalRepository.save(centroVecinal);
    }

    public List<CentroVecinal> obtenerTodos() {
        return centroVecinalRepository.findAll();
    }
}
