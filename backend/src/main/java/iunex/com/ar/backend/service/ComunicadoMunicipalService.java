package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.ComunicadoMunicipalDTO;
import iunex.com.ar.backend.dto.ComunicadoMunicipalRequestDTO;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.ComunicadoMunicipal;
import iunex.com.ar.backend.model.EstadoComunicadoMunicipal;
import iunex.com.ar.backend.model.Municipio;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.ComunicadoMunicipalRepository;
import iunex.com.ar.backend.repository.MunicipioRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComunicadoMunicipalService {

    @Autowired
    private ComunicadoMunicipalRepository comunicadoMunicipalRepository;

    @Autowired
    private MunicipioRepository municipioRepository;

    @Autowired
    private BarrioRepository barrioRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private NotificacionService notificacionService;

    @Transactional
    public ComunicadoMunicipalDTO crearComunicado(ComunicadoMunicipalRequestDTO dto, Authentication authentication) {
        Municipio municipio = getMunicipioAutenticado(authentication);
        Barrio barrio = resolveBarrio(dto);

        ComunicadoMunicipal comunicado = new ComunicadoMunicipal();
        comunicado.setMunicipio(municipio);
        comunicado.setBarrio(barrio);
        comunicado.setTitulo(dto.getTitulo().trim());
        comunicado.setContenido(dto.getContenido().trim());
        comunicado.setImagenPortada(normalizeOptional(dto.getImagenPortada()));
        comunicado.setEsGlobal(dto.isEsGlobal());
        comunicado.setDestacado(dto.isDestacado());
        comunicado.setEstado(EstadoComunicadoMunicipal.BORRADOR);

        return toDto(comunicadoMunicipalRepository.save(comunicado));
    }

    @Transactional
    public ComunicadoMunicipalDTO actualizarComunicado(Long comunicadoId, ComunicadoMunicipalRequestDTO dto, Authentication authentication) {
        Municipio municipio = getMunicipioAutenticado(authentication);
        ComunicadoMunicipal comunicado = getComunicadoPropio(comunicadoId, municipio.getId());
        Barrio barrio = resolveBarrio(dto);

        comunicado.setBarrio(barrio);
        comunicado.setTitulo(dto.getTitulo().trim());
        comunicado.setContenido(dto.getContenido().trim());
        comunicado.setImagenPortada(normalizeOptional(dto.getImagenPortada()));
        comunicado.setEsGlobal(dto.isEsGlobal());
        comunicado.setDestacado(dto.isDestacado());

        if (comunicado.getEstado() == EstadoComunicadoMunicipal.PUBLICADO) {
            comunicado.setFechaPublicacion(LocalDateTime.now());
        }

        return toDto(comunicadoMunicipalRepository.save(comunicado));
    }

    @Transactional
    public ComunicadoMunicipalDTO publicarComunicado(Long comunicadoId, Authentication authentication) {
        Municipio municipio = getMunicipioAutenticado(authentication);
        ComunicadoMunicipal comunicado = getComunicadoPropio(comunicadoId, municipio.getId());

        comunicado.setEstado(EstadoComunicadoMunicipal.PUBLICADO);
        comunicado.setFechaPublicacion(LocalDateTime.now());
        ComunicadoMunicipal comunicadoGuardado = comunicadoMunicipalRepository.save(comunicado);
        notificacionService.crearNotificacionesPorNuevoComunicado(comunicadoGuardado);
        return toDto(comunicadoGuardado);
    }

    @Transactional
    public ComunicadoMunicipalDTO archivarComunicado(Long comunicadoId, Authentication authentication) {
        Municipio municipio = getMunicipioAutenticado(authentication);
        ComunicadoMunicipal comunicado = getComunicadoPropio(comunicadoId, municipio.getId());

        comunicado.setEstado(EstadoComunicadoMunicipal.ARCHIVADO);
        return toDto(comunicadoMunicipalRepository.save(comunicado));
    }

    @Transactional(readOnly = true)
    public List<ComunicadoMunicipalDTO> listarComunicadosMunicipio(Authentication authentication) {
        Municipio municipio = getMunicipioAutenticado(authentication);

        return comunicadoMunicipalRepository.findAllByMunicipioIdOrderByCreatedAtDesc(municipio.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComunicadoMunicipalDTO> listarComunicadosVisibles(Authentication authentication) {
        User user = getUserAutenticado(authentication);

        if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            return listarComunicadosMunicipio(authentication);
        }

        Ciudadano ciudadano = ciudadanoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."));

        Long barrioId = ciudadano.getBarrio().getId();

        return comunicadoMunicipalRepository
                .findAllByEstadoOrderByDestacadoDescFechaPublicacionDescCreatedAtDesc(EstadoComunicadoMunicipal.PUBLICADO)
                .stream()
                .filter((comunicado) -> comunicado.isEsGlobal()
                        || (comunicado.getBarrio() != null && comunicado.getBarrio().getId().equals(barrioId)))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComunicadoMunicipalDTO obtenerComunicado(Long comunicadoId, Authentication authentication) {
        User user = getUserAutenticado(authentication);
        ComunicadoMunicipal comunicado = comunicadoMunicipalRepository.findById(comunicadoId)
                .orElseThrow(() -> new RuntimeException("El comunicado seleccionado no existe."));

        if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            Municipio municipio = municipioRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("No se encontró un perfil de municipio asociado."));

            if (!comunicado.getMunicipio().getId().equals(municipio.getId())) {
                throw new RuntimeException("No tenés permisos para ver este comunicado.");
            }

            return toDto(comunicado);
        }

        Ciudadano ciudadano = ciudadanoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."));

        boolean visible = comunicado.getEstado() == EstadoComunicadoMunicipal.PUBLICADO
                && (comunicado.isEsGlobal()
                || (comunicado.getBarrio() != null
                && comunicado.getBarrio().getId().equals(ciudadano.getBarrio().getId())));

        if (!visible) {
            throw new RuntimeException("No tenés permisos para ver este comunicado.");
        }

        return toDto(comunicado);
    }

    private Barrio resolveBarrio(ComunicadoMunicipalRequestDTO dto) {
        validarDto(dto);

        if (dto.isEsGlobal()) {
            return null;
        }

        return barrioRepository.findById(dto.getBarrioId())
                .orElseThrow(() -> new RuntimeException("El barrio seleccionado no existe."));
    }

    private void validarDto(ComunicadoMunicipalRequestDTO dto) {
        if (dto == null) {
            throw new RuntimeException("Los datos del comunicado son obligatorios.");
        }

        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new RuntimeException("El título del comunicado es obligatorio.");
        }

        if (dto.getContenido() == null || dto.getContenido().isBlank()) {
            throw new RuntimeException("El contenido del comunicado es obligatorio.");
        }

        if (!dto.isEsGlobal() && dto.getBarrioId() == null) {
            throw new RuntimeException("Debés seleccionar un barrio o marcar el comunicado como global.");
        }
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private Municipio getMunicipioAutenticado(Authentication authentication) {
        User user = getUserAutenticado(authentication);

        if (!"ROLE_MUNICIPIO".equals(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para el municipio.");
        }

        return municipioRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil de municipio asociado."));
    }

    private User getUserAutenticado(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No hay una sesión autenticada.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));
    }

    private ComunicadoMunicipal getComunicadoPropio(Long comunicadoId, Long municipioId) {
        if (comunicadoId == null) {
            throw new RuntimeException("El comunicado seleccionado es obligatorio.");
        }

        ComunicadoMunicipal comunicado = comunicadoMunicipalRepository.findById(comunicadoId)
                .orElseThrow(() -> new RuntimeException("El comunicado seleccionado no existe."));

        if (!comunicado.getMunicipio().getId().equals(municipioId)) {
            throw new RuntimeException("No tenés permisos para modificar este comunicado.");
        }

        return comunicado;
    }

    private ComunicadoMunicipalDTO toDto(ComunicadoMunicipal comunicado) {
        ComunicadoMunicipalDTO dto = new ComunicadoMunicipalDTO();
        dto.setId(comunicado.getId());
        dto.setMunicipioId(comunicado.getMunicipio().getId());
        dto.setMunicipioNombre(comunicado.getMunicipio().getNombre());
        dto.setBarrioId(comunicado.getBarrio() != null ? comunicado.getBarrio().getId() : null);
        dto.setBarrioNombre(comunicado.getBarrio() != null ? comunicado.getBarrio().getNombre() : null);
        dto.setTitulo(comunicado.getTitulo());
        dto.setContenido(comunicado.getContenido());
        dto.setImagenPortada(comunicado.getImagenPortada());
        dto.setEstado(comunicado.getEstado().name());
        dto.setFechaPublicacion(comunicado.getFechaPublicacion());
        dto.setEsGlobal(comunicado.isEsGlobal());
        dto.setDestacado(comunicado.isDestacado());
        dto.setCreatedAt(comunicado.getCreatedAt());
        dto.setUpdatedAt(comunicado.getUpdatedAt());
        return dto;
    }
}
