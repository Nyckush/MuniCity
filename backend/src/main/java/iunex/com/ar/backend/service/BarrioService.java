package iunex.com.ar.backend.service;

import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.repository.BarrioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BarrioService {

    @Autowired
    private BarrioRepository barrioRepository;

    // 1. Guardar un barrio nuevo
    public Barrio guardarBarrio(Barrio barrio) {
        if (barrio == null || barrio.getNombre() == null || barrio.getNombre().isBlank()) {
            throw new RuntimeException("El nombre del barrio es obligatorio.");
        }

        // Limpiamos espacios en blanco de los costados y pasamos a mayúsculas para estandarizar
        String nombreFormateado = barrio.getNombre().trim().toUpperCase();

        if (barrioRepository.existsByNombre(nombreFormateado)) {
            throw new RuntimeException("El barrio '" + nombreFormateado + "' ya existe.");
        }

        barrio.setNombre(nombreFormateado);
        return barrioRepository.save(barrio);
    }

    // 2. Traer todos los barrios para el Select del frontend
    public List<Barrio> obtenerTodos() {
        return barrioRepository.findAll();
    }
}
