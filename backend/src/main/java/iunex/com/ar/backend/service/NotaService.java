package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.NotaDTO;
import iunex.com.ar.backend.dto.NotaRequestDTO;
import iunex.com.ar.backend.dto.ActualizarEstadoNotaDTO;
import iunex.com.ar.backend.model.ApoyoNota;
import iunex.com.ar.backend.model.CategoriaNota;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.EstadoNota;
import iunex.com.ar.backend.model.Nota;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.ApoyoNotaRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.NotaRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class NotaService {

    private static final Comparator<NotaDTO> NOTA_RELEVANCE_COMPARATOR =
            Comparator.comparing(NotaDTO::getCantidadApoyos, Comparator.nullsFirst(Long::compareTo))
                    .reversed()
                    .thenComparing(NotaDTO::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private NotaRepository notaRepository;

    @Autowired
    private ApoyoNotaRepository apoyoNotaRepository;

    @Transactional
    public NotaDTO crearNota(NotaRequestDTO dto, Authentication authentication) {
        if (dto == null) {
            throw new RuntimeException("Los datos de la nota son obligatorios.");
        }

        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new RuntimeException("El título de la nota es obligatorio.");
        }

        if (dto.getContenido() == null || dto.getContenido().isBlank()) {
            throw new RuntimeException("El contenido de la nota es obligatorio.");
        }

        if (dto.getCategoria() == null) {
            throw new RuntimeException("La categoría de la nota es obligatoria.");
        }

        Ciudadano presidente = getPresidenteAutenticado(authentication);
        CentroVecinal centroVecinal = presidente.getCentroVecinalPresidido();

        if (centroVecinal == null) {
            throw new RuntimeException("El presidente no tiene un centro vecinal asignado.");
        }

        Nota nota = new Nota();
        nota.setAutor(presidente);
        nota.setCentroVecinal(centroVecinal);
        nota.setTitulo(dto.getTitulo().trim());
        nota.setContenido(dto.getContenido().trim());
        nota.setCategoria(dto.getCategoria());
        nota.setEstado(EstadoNota.ENTREGADO);
        nota.setMotivoEstado(null);

        return toDto(notaRepository.save(nota), presidente.getId());
    }

    @Transactional(readOnly = true)
    public List<NotaDTO> listarMisNotas(Authentication authentication) {
        Ciudadano presidente = getPresidenteAutenticado(authentication);

        return notaRepository.findAllByAutorIdOrderByCreatedAtDesc(presidente.getId())
                .stream()
                .map(nota -> toDto(nota, presidente.getId()))
                .sorted(NOTA_RELEVANCE_COMPARATOR)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotaDTO> listarNotas(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        final Long ciudadanoId;

        if ("ROLE_CIUDADANO".equals(user.getRole()) || "ROLE_PRESIDENTE".equals(user.getRole())) {
            ciudadanoId = ciudadanoRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."))
                    .getId();
        } else if (!"ROLE_MUNICIPIO".equals(user.getRole())) {
            throw new RuntimeException("Esta acción no está disponible para el rol autenticado.");
        } else {
            ciudadanoId = null;
        }

        return notaRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(nota -> toDto(nota, ciudadanoId))
                .sorted(NOTA_RELEVANCE_COMPARATOR)
                .toList();
    }

    @Transactional
    public NotaDTO apoyarNota(Long notaId, Authentication authentication) {
        if (notaId == null) {
            throw new RuntimeException("La nota es obligatoria.");
        }

        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        if (apoyoNotaRepository.existsByCiudadanoIdAndNotaId(ciudadano.getId(), notaId)) {
            throw new RuntimeException("Ya apoyaste esta nota.");
        }

        Nota nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new RuntimeException("La nota seleccionada no existe."));

        ApoyoNota apoyoNota = new ApoyoNota();
        apoyoNota.setCiudadano(ciudadano);
        apoyoNota.setNota(nota);
        apoyoNotaRepository.save(apoyoNota);

        return toDto(nota, ciudadano.getId());
    }

    @Transactional
    public NotaDTO obtenerNota(Long notaId, Authentication authentication) {
        if (notaId == null) {
            throw new RuntimeException("La nota es obligatoria.");
        }

        User user = getAuthenticatedUser(authentication);
        Long ciudadanoId = null;

        if ("ROLE_CIUDADANO".equals(user.getRole()) || "ROLE_PRESIDENTE".equals(user.getRole())) {
            ciudadanoId = ciudadanoRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."))
                    .getId();
        } else if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            // lectura administrativa
        } else {
            throw new RuntimeException("Esta acción no está disponible para el rol autenticado.");
        }

        Nota nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new RuntimeException("La nota seleccionada no existe."));

        if ("ROLE_MUNICIPIO".equals(user.getRole()) && nota.getEstado() == EstadoNota.ENTREGADO) {
            nota.setEstado(EstadoNota.LEIDO);
            nota = notaRepository.save(nota);
        }

        return toDto(nota, ciudadanoId);
    }

    @Transactional
    public NotaDTO actualizarEstadoNota(Long notaId, ActualizarEstadoNotaDTO dto, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        if (!"ROLE_MUNICIPIO".equals(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para el municipio.");
        }

        if (notaId == null) {
            throw new RuntimeException("La nota es obligatoria.");
        }

        if (dto == null || dto.getEstado() == null) {
            throw new RuntimeException("El nuevo estado de la nota es obligatorio.");
        }

        if (dto.getEstado() != EstadoNota.APROBADA && dto.getEstado() != EstadoNota.RECHAZADA) {
            throw new RuntimeException("Solo podés cambiar la nota a aprobada o rechazada.");
        }

        Nota nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new RuntimeException("La nota seleccionada no existe."));

        nota.setEstado(dto.getEstado());
        nota.setMotivoEstado(normalizarTexto(dto.getMotivo()));

        return toDto(notaRepository.save(nota), null);
    }

    private Ciudadano getPresidenteAutenticado(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
        User user = ciudadano.getUser();

        if (!"ROLE_PRESIDENTE".equals(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para presidentes.");
        }

        return ciudadano;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No hay una sesión autenticada.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));
    }

    private Ciudadano getCiudadanoAutenticado(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        if (!"ROLE_CIUDADANO".equals(user.getRole()) && !"ROLE_PRESIDENTE".equals(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para ciudadanos.");
        }

        return ciudadanoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."));
    }

    private String normalizarTexto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private NotaDTO toDto(Nota nota, Long ciudadanoId) {
        NotaDTO dto = new NotaDTO();
        dto.setId(nota.getId());
        dto.setBarrioId(nota.getCentroVecinal().getBarrio().getId());
        dto.setCentroVecinalId(nota.getCentroVecinal().getId());
        dto.setCentroVecinalNombre(nota.getCentroVecinal().getNombre());
        dto.setBarrioNombre(nota.getCentroVecinal().getBarrio().getNombre());
        dto.setAutorCiudadanoId(nota.getAutor().getId());
        dto.setAutorNombre(nota.getAutor().getNombreCompleto());
        dto.setTitulo(nota.getTitulo());
        dto.setContenido(nota.getContenido());
        dto.setCategoria(nota.getCategoria());
        dto.setEstado(nota.getEstado());
        dto.setMotivoEstado(nota.getMotivoEstado());
        dto.setCantidadApoyos(apoyoNotaRepository.countByNotaId(nota.getId()));
        dto.setApoyadaPorMi(
                ciudadanoId != null && apoyoNotaRepository.existsByCiudadanoIdAndNotaId(ciudadanoId, nota.getId())
        );
        dto.setCreatedAt(nota.getCreatedAt());
        return dto;
    }
}
