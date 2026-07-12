package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.CrearEleccionDTO;
import iunex.com.ar.backend.dto.EleccionCandidatoResultadoDTO;
import iunex.com.ar.backend.dto.EleccionDetalleMunicipioDTO;
import iunex.com.ar.backend.dto.EleccionDTO;
import iunex.com.ar.backend.model.Candidatura;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Eleccion;
import iunex.com.ar.backend.model.EstadoEleccion;
import iunex.com.ar.backend.model.Voto;
import iunex.com.ar.backend.repository.CandidaturaRepository;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.EleccionRepository;
import iunex.com.ar.backend.repository.VotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EleccionService {

    @Autowired
    private EleccionRepository eleccionRepository;

    @Autowired
    private CentroVecinalRepository centroVecinalRepository;

    @Autowired
    private CandidaturaRepository candidaturaRepository;

    @Autowired
    private VotoRepository votoRepository;

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

    @Transactional
    public EleccionDTO finalizarEleccion(Long eleccionId) {
        if (eleccionId == null) {
            throw new RuntimeException("La elección a finalizar es obligatoria.");
        }

        Eleccion eleccion = eleccionRepository.findById(eleccionId)
                .orElseThrow(() -> new RuntimeException("La elección seleccionada no existe."));

        if (resolverEstadoActual(eleccion) == EstadoEleccion.FINALIZADA) {
            throw new RuntimeException("La elección ya se encuentra finalizada.");
        }

        eleccion.setEstado(EstadoEleccion.FINALIZADA);
        return toDto(eleccionRepository.save(eleccion));
    }

    @Transactional(readOnly = true)
    public List<EleccionDTO> listarElecciones() {
        return eleccionRepository.findAllByOrderByFechaInicioPostulacionDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EleccionDetalleMunicipioDTO> listarEleccionesConDetalle() {
        return eleccionRepository.findAllByOrderByFechaInicioPostulacionDesc()
                .stream()
                .map(this::toDetailDto)
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

    private EstadoEleccion resolverEstadoActual(Eleccion eleccion) {
        if (eleccion.getEstado() == EstadoEleccion.FINALIZADA) {
            return EstadoEleccion.FINALIZADA;
        }

        return calcularEstadoInicial(
                eleccion.getFechaInicioPostulacion(),
                eleccion.getFechaFinPostulacion(),
                eleccion.getFechaInicioVotacion(),
                eleccion.getFechaFinVotacion()
        );
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
        EstadoEleccion estadoActual = resolverEstadoActual(eleccion);
        eleccion.setEstado(estadoActual);
        dto.setEstado(estadoActual);
        return dto;
    }

    private EleccionDetalleMunicipioDTO toDetailDto(Eleccion eleccion) {
        EleccionDetalleMunicipioDTO dto = new EleccionDetalleMunicipioDTO();
        dto.setId(eleccion.getId());
        dto.setCentroVecinalId(eleccion.getCentroVecinal().getId());
        dto.setCentroVecinalNombre(eleccion.getCentroVecinal().getNombre());
        dto.setBarrioId(eleccion.getCentroVecinal().getBarrio().getId());
        dto.setBarrioNombre(eleccion.getCentroVecinal().getBarrio().getNombre());
        dto.setFechaInicioPostulacion(eleccion.getFechaInicioPostulacion());
        dto.setFechaFinPostulacion(eleccion.getFechaFinPostulacion());
        dto.setFechaInicioVotacion(eleccion.getFechaInicioVotacion());
        dto.setFechaFinVotacion(eleccion.getFechaFinVotacion());

        EstadoEleccion estadoActual = resolverEstadoActual(eleccion);
        eleccion.setEstado(estadoActual);
        dto.setEstado(estadoActual);

        List<Candidatura> candidaturas = candidaturaRepository.findAllByEleccionIdOrderByFechaPostulacionAsc(eleccion.getId());
        List<Voto> votos = votoRepository.findAllByEleccionId(eleccion.getId());
        Map<Long, Long> votosPorCandidatura = votos.stream()
                .collect(Collectors.groupingBy((voto) -> voto.getCandidatura().getId(), Collectors.counting()));

        dto.setTotalPostulantes(candidaturas.size());
        dto.setTotalVotos(votos.size());

        List<EleccionCandidatoResultadoDTO> candidatos = candidaturas.stream()
                .map((candidatura) -> {
                    EleccionCandidatoResultadoDTO candidatoDto = new EleccionCandidatoResultadoDTO();
                    candidatoDto.setCandidaturaId(candidatura.getId());
                    candidatoDto.setCiudadanoId(candidatura.getCiudadano().getId());
                    candidatoDto.setNombreCompleto(candidatura.getCiudadano().getNombreCompleto());
                    candidatoDto.setApellido(candidatura.getCiudadano().getApellido());
                    candidatoDto.setFotoPerfil(candidatura.getCiudadano().getUser().getFotoPerfil());
                    candidatoDto.setEstadoValidacion(candidatura.getEstadoValidacion().name());
                    candidatoDto.setCantidadVotos(votosPorCandidatura.getOrDefault(candidatura.getId(), 0L));
                    return candidatoDto;
                })
                .sorted(
                        Comparator.comparingLong(EleccionCandidatoResultadoDTO::getCantidadVotos)
                                .reversed()
                                .thenComparing(EleccionCandidatoResultadoDTO::getNombreCompleto, Comparator.nullsLast(String::compareToIgnoreCase))
                )
                .toList();

        dto.setCandidatos(candidatos);

        candidatos.stream()
                .max(Comparator.comparingLong(EleccionCandidatoResultadoDTO::getCantidadVotos))
                .filter((candidato) -> candidato.getCantidadVotos() > 0)
                .ifPresent((ganador) -> {
                    long maxVotos = ganador.getCantidadVotos();
                    long ganadores = candidatos.stream()
                            .filter((candidato) -> candidato.getCantidadVotos() == maxVotos)
                            .count();

                    if (ganadores == 1) {
                        ganador.setGanador(true);
                        dto.setGanadorNombre(ganador.getNombreCompleto());
                        dto.setGanadorCandidaturaId(ganador.getCandidaturaId());
                    }
                });

        return dto;
    }
}
