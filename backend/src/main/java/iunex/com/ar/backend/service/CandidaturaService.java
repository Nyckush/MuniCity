package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.CandidaturaDTO;
import iunex.com.ar.backend.dto.EleccionCiudadanaDTO;
import iunex.com.ar.backend.dto.PostulacionRequestDTO;
import iunex.com.ar.backend.model.Candidatura;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.Eleccion;
import iunex.com.ar.backend.model.EstadoEleccion;
import iunex.com.ar.backend.model.EstadoValidacionCandidatura;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.CandidaturaRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.EleccionRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CandidaturaService {

    private static final List<String> ALLOWED_CITIZEN_ROLES = List.of("ROLE_CIUDADANO", "ROLE_PRESIDENTE");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private EleccionRepository eleccionRepository;

    @Autowired
    private CandidaturaRepository candidaturaRepository;

    @Transactional(readOnly = true)
    public List<EleccionCiudadanaDTO> listarEleccionesDisponibles(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        return eleccionRepository.findByCentroVecinalBarrioIdOrderByFechaInicioPostulacionDesc(ciudadano.getBarrio().getId())
                .stream()
                .filter((eleccion) -> calcularEstadoActual(eleccion) != EstadoEleccion.FINALIZADA)
                .map((eleccion) -> toEleccionCiudadanaDto(eleccion, ciudadano))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CandidaturaDTO> listarMisPostulaciones(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        return candidaturaRepository.findAllByCiudadanoIdOrderByFechaPostulacionDesc(ciudadano.getId())
                .stream()
                .map(this::toCandidaturaDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CandidaturaDTO> listarPostulantesRegistrados(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        return candidaturaRepository
                .findAllByEleccionCentroVecinalBarrioIdOrderByFechaPostulacionDesc(ciudadano.getBarrio().getId())
                .stream()
                .map(this::toCandidaturaDto)
                .toList();
    }

    @Transactional
    public CandidaturaDTO postularme(PostulacionRequestDTO dto, Authentication authentication) {
        if (dto == null || dto.getEleccionId() == null) {
            throw new RuntimeException("La elección seleccionada es obligatoria.");
        }

        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
        Eleccion eleccion = eleccionRepository.findById(dto.getEleccionId())
                .orElseThrow(() -> new RuntimeException("La elección seleccionada no existe."));

        if (!eleccion.getCentroVecinal().getBarrio().getId().equals(ciudadano.getBarrio().getId())) {
            throw new RuntimeException("Solo podés postularte a elecciones de tu propio barrio.");
        }

        EstadoEleccion estadoActual = calcularEstadoActual(eleccion);
        if (estadoActual != EstadoEleccion.POSTULACION) {
            throw new RuntimeException("La elección seleccionada no está en período de postulación.");
        }

        if (candidaturaRepository.existsByEleccionIdAndCiudadanoId(eleccion.getId(), ciudadano.getId())) {
            throw new RuntimeException("Ya te postulaste en esta elección.");
        }

        Candidatura candidatura = new Candidatura();
        candidatura.setEleccion(eleccion);
        candidatura.setCiudadano(ciudadano);
        candidatura.setEstadoValidacion(EstadoValidacionCandidatura.PENDIENTE);

        return toCandidaturaDto(candidaturaRepository.save(candidatura));
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

    private EleccionCiudadanaDTO toEleccionCiudadanaDto(Eleccion eleccion, Ciudadano ciudadano) {
        EleccionCiudadanaDTO dto = new EleccionCiudadanaDTO();
        dto.setEleccionId(eleccion.getId());
        dto.setCentroVecinalId(eleccion.getCentroVecinal().getId());
        dto.setCentroVecinalNombre(eleccion.getCentroVecinal().getNombre());
        dto.setBarrioNombre(eleccion.getCentroVecinal().getBarrio().getNombre());
        dto.setFechaInicioPostulacion(eleccion.getFechaInicioPostulacion());
        dto.setFechaFinPostulacion(eleccion.getFechaFinPostulacion());
        dto.setFechaInicioVotacion(eleccion.getFechaInicioVotacion());
        dto.setFechaFinVotacion(eleccion.getFechaFinVotacion());
        dto.setEstadoEleccion(calcularEstadoActual(eleccion));

        candidaturaRepository.findByEleccionIdAndCiudadanoId(eleccion.getId(), ciudadano.getId())
                .ifPresent((candidatura) -> {
                    dto.setYaPostulado(true);
                    dto.setEstadoPostulacion(candidatura.getEstadoValidacion());
                });

        return dto;
    }

    private CandidaturaDTO toCandidaturaDto(Candidatura candidatura) {
        CandidaturaDTO dto = new CandidaturaDTO();
        dto.setCandidaturaId(candidatura.getId());
        dto.setEleccionId(candidatura.getEleccion().getId());
        dto.setCiudadanoNombre(candidatura.getCiudadano().getNombreCompleto());
        dto.setFotoPerfil(candidatura.getCiudadano().getUser().getFotoPerfil());
        dto.setCentroVecinalNombre(candidatura.getEleccion().getCentroVecinal().getNombre());
        dto.setBarrioNombre(candidatura.getEleccion().getCentroVecinal().getBarrio().getNombre());
        dto.setEstadoEleccion(calcularEstadoActual(candidatura.getEleccion()));
        dto.setEstadoValidacion(candidatura.getEstadoValidacion());
        dto.setFechaPostulacion(candidatura.getFechaPostulacion());
        return dto;
    }
}
