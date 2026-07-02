package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.CrearEleccionDTO;
import iunex.com.ar.backend.dto.EleccionDTO;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Eleccion;
import iunex.com.ar.backend.model.EstadoEleccion;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.EleccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EleccionService {

    @Autowired
    private EleccionRepository eleccionRepository;

    @Autowired
    private CentroVecinalRepository centroVecinalRepository;

    @Transactional
    public EleccionDTO crearEleccion(CrearEleccionDTO dto) {
        validarDatos(dto);

        CentroVecinal centroVecinal = centroVecinalRepository.findById(dto.getCentroVecinalId())
                .orElseThrow(() -> new RuntimeException("El centro vecinal seleccionado no existe."));

        boolean tieneEleccionActiva = eleccionRepository.existsByCentroVecinalIdAndEstadoIn(
                centroVecinal.getId(),
                List.of(EstadoEleccion.CONVOCADA, EstadoEleccion.POSTULACION, EstadoEleccion.VOTACION)
        );

        if (tieneEleccionActiva) {
            throw new RuntimeException("El centro vecinal seleccionado ya tiene una elección en curso.");
        }

        Eleccion eleccion = new Eleccion();
        eleccion.setCentroVecinal(centroVecinal);
        eleccion.setFechaInicioPostulacion(dto.getFechaInicioPostulacion());
        eleccion.setFechaFinPostulacion(dto.getFechaFinPostulacion());
        eleccion.setFechaInicioVotacion(dto.getFechaInicioVotacion());
        eleccion.setFechaFinVotacion(dto.getFechaFinVotacion());
        eleccion.setEstado(calcularEstadoInicial(dto.getFechaInicioPostulacion(), dto.getFechaFinPostulacion(), dto.getFechaInicioVotacion(), dto.getFechaFinVotacion()));

        return toDto(eleccionRepository.save(eleccion));
    }

    @Transactional
    public EleccionDTO actualizarEleccion(Long eleccionId, CrearEleccionDTO dto) {
        if (eleccionId == null) {
            throw new RuntimeException("La elección a editar es obligatoria.");
        }

        validarDatos(dto);

        Eleccion eleccion = eleccionRepository.findById(eleccionId)
                .orElseThrow(() -> new RuntimeException("La elección seleccionada no existe."));

        CentroVecinal centroVecinal = centroVecinalRepository.findById(dto.getCentroVecinalId())
                .orElseThrow(() -> new RuntimeException("El centro vecinal seleccionado no existe."));

        boolean tieneOtraEleccionActiva = eleccionRepository.existsByCentroVecinalIdAndEstadoInAndIdNot(
                centroVecinal.getId(),
                List.of(EstadoEleccion.CONVOCADA, EstadoEleccion.POSTULACION, EstadoEleccion.VOTACION),
                eleccionId
        );

        if (tieneOtraEleccionActiva) {
            throw new RuntimeException("El centro vecinal seleccionado ya tiene otra elección en curso.");
        }

        eleccion.setCentroVecinal(centroVecinal);
        eleccion.setFechaInicioPostulacion(dto.getFechaInicioPostulacion());
        eleccion.setFechaFinPostulacion(dto.getFechaFinPostulacion());
        eleccion.setFechaInicioVotacion(dto.getFechaInicioVotacion());
        eleccion.setFechaFinVotacion(dto.getFechaFinVotacion());
        eleccion.setEstado(calcularEstadoInicial(
                dto.getFechaInicioPostulacion(),
                dto.getFechaFinPostulacion(),
                dto.getFechaInicioVotacion(),
                dto.getFechaFinVotacion()
        ));

        return toDto(eleccionRepository.save(eleccion));
    }

    @Transactional(readOnly = true)
    public List<EleccionDTO> listarElecciones() {
        return eleccionRepository.findAllByOrderByFechaInicioPostulacionDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private void validarDatos(CrearEleccionDTO dto) {
        if (dto == null) {
            throw new RuntimeException("Los datos de la elección son obligatorios.");
        }

        if (dto.getCentroVecinalId() == null) {
            throw new RuntimeException("Debés seleccionar un centro vecinal.");
        }

        if (dto.getFechaInicioPostulacion() == null || dto.getFechaFinPostulacion() == null
                || dto.getFechaInicioVotacion() == null || dto.getFechaFinVotacion() == null) {
            throw new RuntimeException("Todas las fechas de la elección son obligatorias.");
        }

        if (!dto.getFechaFinPostulacion().isAfter(dto.getFechaInicioPostulacion())) {
            throw new RuntimeException("La fecha de fin de postulación debe ser posterior al inicio.");
        }

        if (!dto.getFechaInicioVotacion().isAfter(dto.getFechaFinPostulacion())
                && !dto.getFechaInicioVotacion().isEqual(dto.getFechaFinPostulacion())) {
            throw new RuntimeException("La votación debe comenzar cuando termine o después de la postulación.");
        }

        if (!dto.getFechaFinVotacion().isAfter(dto.getFechaInicioVotacion())) {
            throw new RuntimeException("La fecha de fin de votación debe ser posterior al inicio.");
        }
    }

    private EstadoEleccion calcularEstadoInicial(
            LocalDateTime fechaInicioPostulacion,
            LocalDateTime fechaFinPostulacion,
            LocalDateTime fechaInicioVotacion,
            LocalDateTime fechaFinVotacion
    ) {
        LocalDateTime ahora = LocalDateTime.now();

        if (ahora.isBefore(fechaInicioPostulacion)) {
            return EstadoEleccion.CONVOCADA;
        }

        if ((ahora.isAfter(fechaInicioPostulacion) || ahora.isEqual(fechaInicioPostulacion))
                && ahora.isBefore(fechaFinPostulacion)) {
            return EstadoEleccion.POSTULACION;
        }

        if ((ahora.isAfter(fechaInicioVotacion) || ahora.isEqual(fechaInicioVotacion))
                && ahora.isBefore(fechaFinVotacion)) {
            return EstadoEleccion.VOTACION;
        }

        if (ahora.isAfter(fechaFinVotacion)) {
            return EstadoEleccion.FINALIZADA;
        }

        return EstadoEleccion.CONVOCADA;
    }

    private EleccionDTO toDto(Eleccion eleccion) {
        EleccionDTO dto = new EleccionDTO();
        dto.setId(eleccion.getId());
        dto.setCentroVecinalId(eleccion.getCentroVecinal().getId());
        dto.setCentroVecinalNombre(eleccion.getCentroVecinal().getNombre());
        dto.setBarrioId(eleccion.getCentroVecinal().getBarrio().getId());
        dto.setBarrioNombre(eleccion.getCentroVecinal().getBarrio().getNombre());
        dto.setFechaInicioPostulacion(eleccion.getFechaInicioPostulacion());
        dto.setFechaFinPostulacion(eleccion.getFechaFinPostulacion());
        dto.setFechaInicioVotacion(eleccion.getFechaInicioVotacion());
        dto.setFechaFinVotacion(eleccion.getFechaFinVotacion());
        EstadoEleccion estadoActual = calcularEstadoInicial(
                eleccion.getFechaInicioPostulacion(),
                eleccion.getFechaFinPostulacion(),
                eleccion.getFechaInicioVotacion(),
                eleccion.getFechaFinVotacion()
        );
        eleccion.setEstado(estadoActual);
        dto.setEstado(estadoActual);
        return dto;
    }
}
