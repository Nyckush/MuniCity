package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.CandidatoVotacionDTO;
import iunex.com.ar.backend.dto.EleccionVotacionDTO;
import iunex.com.ar.backend.dto.VotoDTO;
import iunex.com.ar.backend.dto.VotoRequestDTO;
import iunex.com.ar.backend.model.Candidatura;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.Eleccion;
import iunex.com.ar.backend.model.EstadoEleccion;
import iunex.com.ar.backend.model.EstadoValidacionCandidatura;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.model.Voto;
import iunex.com.ar.backend.repository.CandidaturaRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.EleccionRepository;
import iunex.com.ar.backend.repository.UserRepository;
import iunex.com.ar.backend.repository.VotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VotoService {

    private static final List<String> ALLOWED_CITIZEN_ROLES = List.of("ROLE_CIUDADANO", "ROLE_PRESIDENTE");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private EleccionRepository eleccionRepository;

    @Autowired
    private CandidaturaRepository candidaturaRepository;

    @Autowired
    private VotoRepository votoRepository;

    @Transactional(readOnly = true)
    public List<EleccionVotacionDTO> listarEleccionesParaVotar(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        return eleccionRepository.findByCentroVecinalBarrioIdOrderByFechaInicioPostulacionDesc(ciudadano.getBarrio().getId())
                .stream()
                .filter((eleccion) -> calcularEstadoActual(eleccion) == EstadoEleccion.VOTACION)
                .map((eleccion) -> toEleccionVotacionDto(eleccion, ciudadano))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VotoDTO> listarMisVotos(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        return votoRepository.findAllByCiudadanoIdOrderByFechaVotoDesc(ciudadano.getId())
                .stream()
                .map(this::toVotoDto)
                .toList();
    }

    @Transactional
    public VotoDTO votar(VotoRequestDTO dto, Authentication authentication) {
        if (dto == null || dto.getEleccionId() == null || dto.getCandidaturaId() == null) {
            throw new RuntimeException("La elección y el candidato seleccionados son obligatorios.");
        }

        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
        Eleccion eleccion = eleccionRepository.findById(dto.getEleccionId())
                .orElseThrow(() -> new RuntimeException("La elección seleccionada no existe."));

        if (!eleccion.getCentroVecinal().getBarrio().getId().equals(ciudadano.getBarrio().getId())) {
            throw new RuntimeException("Solo podés votar en elecciones de tu propio barrio.");
        }

        if (calcularEstadoActual(eleccion) != EstadoEleccion.VOTACION) {
            throw new RuntimeException("La elección seleccionada no se encuentra en período de votación.");
        }

        if (votoRepository.existsByEleccionIdAndCiudadanoId(eleccion.getId(), ciudadano.getId())) {
            throw new RuntimeException("Ya emitiste tu voto en esta elección.");
        }

        Candidatura candidatura = candidaturaRepository.findById(dto.getCandidaturaId())
                .orElseThrow(() -> new RuntimeException("El candidato seleccionado no existe."));

        if (!candidatura.getEleccion().getId().equals(eleccion.getId())) {
            throw new RuntimeException("El candidato seleccionado no pertenece a esta elección.");
        }

        if (candidatura.getEstadoValidacion() == EstadoValidacionCandidatura.RECHAZADO) {
            throw new RuntimeException("El candidato seleccionado no está habilitado para la votación.");
        }

        Voto voto = new Voto();
        voto.setEleccion(eleccion);
        voto.setCiudadano(ciudadano);
        voto.setCandidatura(candidatura);

        return toVotoDto(votoRepository.save(voto));
    }

    private Ciudadano getCiudadanoAutenticado(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No hay una sesión autenticada.");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));

        if (!ALLOWED_CITIZEN_ROLES.contains(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para ciudadanos o presidentes.");
        }

        return ciudadanoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."));
    }

    private EstadoEleccion calcularEstadoActual(Eleccion eleccion) {
        if (eleccion.getEstado() == EstadoEleccion.FINALIZADA) {
            return EstadoEleccion.FINALIZADA;
        }

        LocalDateTime ahora = LocalDateTime.now();

        if (ahora.isBefore(eleccion.getFechaInicioPostulacion())) {
            return EstadoEleccion.CONVOCADA;
        }

        if ((ahora.isAfter(eleccion.getFechaInicioPostulacion()) || ahora.isEqual(eleccion.getFechaInicioPostulacion()))
                && ahora.isBefore(eleccion.getFechaFinPostulacion())) {
            return EstadoEleccion.POSTULACION;
        }

        if ((ahora.isAfter(eleccion.getFechaInicioVotacion()) || ahora.isEqual(eleccion.getFechaInicioVotacion()))
                && ahora.isBefore(eleccion.getFechaFinVotacion())) {
            return EstadoEleccion.VOTACION;
        }

        if (ahora.isAfter(eleccion.getFechaFinVotacion()) || ahora.isEqual(eleccion.getFechaFinVotacion())) {
            return EstadoEleccion.FINALIZADA;
        }

        return EstadoEleccion.CONVOCADA;
    }

    private EleccionVotacionDTO toEleccionVotacionDto(Eleccion eleccion, Ciudadano ciudadano) {
        EleccionVotacionDTO dto = new EleccionVotacionDTO();
        dto.setEleccionId(eleccion.getId());
        dto.setCentroVecinalId(eleccion.getCentroVecinal().getId());
        dto.setCentroVecinalNombre(eleccion.getCentroVecinal().getNombre());
        dto.setBarrioNombre(eleccion.getCentroVecinal().getBarrio().getNombre());
        dto.setFechaInicioVotacion(eleccion.getFechaInicioVotacion());
        dto.setFechaFinVotacion(eleccion.getFechaFinVotacion());
        dto.setEstadoEleccion(calcularEstadoActual(eleccion).name());
        dto.setCandidatos(
                candidaturaRepository.findAllByEleccionIdAndEstadoValidacionNotOrderByFechaPostulacionAsc(
                                eleccion.getId(),
                                EstadoValidacionCandidatura.RECHAZADO
                        )
                        .stream()
                        .map(this::toCandidatoDto)
                        .toList()
        );

        votoRepository.findByEleccionIdAndCiudadanoId(eleccion.getId(), ciudadano.getId())
                .ifPresent((voto) -> {
                    dto.setYaVoto(true);
                    dto.setCandidaturaSeleccionadaId(voto.getCandidatura().getId());
                    dto.setCandidatoSeleccionadoNombre(voto.getCandidatura().getCiudadano().getNombreCompleto());
                });

        return dto;
    }

    private CandidatoVotacionDTO toCandidatoDto(Candidatura candidatura) {
        CandidatoVotacionDTO dto = new CandidatoVotacionDTO();
        dto.setCandidaturaId(candidatura.getId());
        dto.setCiudadanoId(candidatura.getCiudadano().getId());
        dto.setNombreCompleto(candidatura.getCiudadano().getNombreCompleto());
        dto.setApellido(candidatura.getCiudadano().getApellido());
        dto.setFotoPerfil(candidatura.getCiudadano().getUser().getFotoPerfil());
        dto.setEstadoValidacion(candidatura.getEstadoValidacion().name());
        return dto;
    }

    private VotoDTO toVotoDto(Voto voto) {
        VotoDTO dto = new VotoDTO();
        dto.setVotoId(voto.getId());
        dto.setEleccionId(voto.getEleccion().getId());
        dto.setCandidaturaId(voto.getCandidatura().getId());
        dto.setCentroVecinalNombre(voto.getEleccion().getCentroVecinal().getNombre());
        dto.setBarrioNombre(voto.getEleccion().getCentroVecinal().getBarrio().getNombre());
        dto.setCandidatoNombre(voto.getCandidatura().getCiudadano().getNombreCompleto());
        dto.setFechaVoto(voto.getFechaVoto());
        return dto;
    }
}
