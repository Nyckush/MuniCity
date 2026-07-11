package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.ObservacionDTO;
import iunex.com.ar.backend.dto.ObservacionRequestDTO;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.EstadoObservacion;
import iunex.com.ar.backend.model.Observacion;
import iunex.com.ar.backend.model.ObservacionImagen;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.ObservacionRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ObservacionService {

    private static final int MAX_IMAGENES = 3;
    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    @Autowired
    private ObservacionRepository observacionRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificacionService notificacionService;

    @Transactional
    public ObservacionDTO guardarObservacion(ObservacionRequestDTO dto, Authentication authentication) {
        if (dto == null) {
            throw new RuntimeException("Los datos de la observación son obligatorios.");
        }

        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new RuntimeException("El título de la observación es obligatorio.");
        }

        if (dto.getDescripcion() == null || dto.getDescripcion().isBlank()) {
            throw new RuntimeException("La descripción de la observación es obligatoria.");
        }

        validarEnlaceUbicacion(dto.getUbicacionEnlace());

        List<MultipartFile> imagenes = normalizarImagenes(dto.getImagenes());
        validarImagenes(imagenes);

        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
        Barrio barrio = ciudadano.getBarrio();

        Observacion observacion = new Observacion();
        observacion.setCiudadano(ciudadano);
        observacion.setBarrio(barrio);
        observacion.setTitulo(dto.getTitulo().trim());
        observacion.setDescripcion(dto.getDescripcion().trim());
        observacion.setEstado(EstadoObservacion.ENTREGADO);
        observacion.setUbicacionEnlace(normalizarTexto(dto.getUbicacionEnlace()));

        for (MultipartFile imagen : imagenes) {
            ObservacionImagen observacionImagen = new ObservacionImagen();
            observacionImagen.setRutaArchivo(guardarImagen(imagen));
            observacion.addImagen(observacionImagen);
        }

        Observacion observacionGuardada = observacionRepository.save(observacion);
        notificacionService.crearNotificacionPorNuevaObservacion(observacionGuardada);

        return toDto(observacionGuardada);
    }

    @Transactional(readOnly = true)
    public List<ObservacionDTO> listarObservaciones(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        if ("ROLE_PRESIDENTE".equals(user.getRole())) {
            return listarObservacionesRecibidas(authentication);
        }

        if ("ROLE_CIUDADANO".equals(user.getRole())) {
            return listarMisObservaciones(authentication);
        }

        throw new RuntimeException("Esta acción no está disponible para el rol autenticado.");
    }

    @Transactional(readOnly = true)
    public List<ObservacionDTO> listarMisObservaciones(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        return observacionRepository.findAllByCiudadanoIdOrderByCreatedAtDesc(ciudadano.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ObservacionDTO> listarObservacionesRecibidas(Authentication authentication) {
        Ciudadano presidente = getPresidenteAutenticado(authentication);
        CentroVecinal centroVecinal = presidente.getCentroVecinalPresidido();

        if (centroVecinal == null) {
            throw new RuntimeException("El presidente no tiene un centro vecinal asignado.");
        }

        return observacionRepository.findAllByBarrioIdOrderByCreatedAtDesc(centroVecinal.getBarrio().getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ObservacionDTO obtenerObservacion(Long observacionId, Authentication authentication) {
        if (observacionId == null) {
            throw new RuntimeException("La observación es obligatoria.");
        }

        Observacion observacion = observacionRepository.findById(observacionId)
                .orElseThrow(() -> new RuntimeException("La observación seleccionada no existe."));

        User user = getAuthenticatedUser(authentication);

        if ("ROLE_PRESIDENTE".equals(user.getRole()) && perteneceAlPresidente(observacion, authentication)) {
            if (observacion.getEstado() == EstadoObservacion.ENTREGADO) {
                observacion.setEstado(EstadoObservacion.LEIDO);
                observacion = observacionRepository.save(observacion);
            }

            return toDto(observacion);
        }

        if ("ROLE_CIUDADANO".equals(user.getRole()) || "ROLE_PRESIDENTE".equals(user.getRole())) {
            Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

            if (!observacion.getCiudadano().getId().equals(ciudadano.getId())) {
                throw new RuntimeException("No tenés permisos para ver esta observación.");
            }

            return toDto(observacion);
        }

        throw new RuntimeException("Esta acción no está disponible para el rol autenticado.");
    }

    private boolean perteneceAlPresidente(Observacion observacion, Authentication authentication) {
        Ciudadano presidente = getPresidenteAutenticado(authentication);
        CentroVecinal centroVecinal = presidente.getCentroVecinalPresidido();

        if (centroVecinal == null) {
            return false;
        }

        return observacion.getBarrio().getId().equals(centroVecinal.getBarrio().getId());
    }

    private void validarEnlaceUbicacion(String ubicacionEnlace) {
        if (ubicacionEnlace == null || ubicacionEnlace.isBlank()) {
            return;
        }

        try {
            URI uri = URI.create(ubicacionEnlace.trim());

            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new RuntimeException("El enlace de ubicación no es válido.");
        }
    }

    private List<MultipartFile> normalizarImagenes(List<MultipartFile> imagenes) {
        if (imagenes == null) {
            return List.of();
        }

        return imagenes.stream()
                .filter(imagen -> imagen != null && !imagen.isEmpty())
                .toList();
    }

    private void validarImagenes(List<MultipartFile> imagenes) {
        if (imagenes.size() > MAX_IMAGENES) {
            throw new RuntimeException("Solo podés subir hasta 3 imágenes por observación.");
        }

        for (MultipartFile imagen : imagenes) {
            if (!ALLOWED_IMAGE_TYPES.contains(imagen.getContentType())) {
                throw new RuntimeException("Solo se permiten imágenes JPG, PNG o WEBP.");
            }

            if (imagen.getSize() > MAX_IMAGE_SIZE_BYTES) {
                throw new RuntimeException("Cada imagen puede pesar hasta 5 MB.");
            }
        }
    }

    private String guardarImagen(MultipartFile imagen) {
        try {
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "observaciones");
            Files.createDirectories(uploadDir);

            String extension = obtenerExtension(imagen.getOriginalFilename());
            String fileName = UUID.randomUUID() + extension;
            Path targetPath = uploadDir.resolve(fileName);

            try (InputStream inputStream = imagen.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/observaciones/" + fileName;
        } catch (IOException exception) {
            throw new RuntimeException("No se pudo guardar una de las imágenes de la observación.");
        }
    }

    private String obtenerExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ".jpg";
        }

        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }

    private String normalizarTexto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
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

    private Ciudadano getPresidenteAutenticado(Authentication authentication) {
        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
        User user = ciudadano.getUser();

        if (!"ROLE_PRESIDENTE".equals(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para presidentes.");
        }

        return ciudadano;
    }

    private ObservacionDTO toDto(Observacion observacion) {
        ObservacionDTO dto = new ObservacionDTO();
        dto.setId(observacion.getId());
        dto.setCiudadanoId(observacion.getCiudadano().getId());
        dto.setCiudadanoNombre(observacion.getCiudadano().getNombreCompleto());
        dto.setBarrioId(observacion.getBarrio().getId());
        dto.setBarrioNombre(observacion.getBarrio().getNombre());
        dto.setTitulo(observacion.getTitulo());
        dto.setDescripcion(observacion.getDescripcion());
        dto.setEstado(observacion.getEstado());
        dto.setUbicacionEnlace(observacion.getUbicacionEnlace());
        dto.setCreatedAt(observacion.getCreatedAt());

        CentroVecinal centroVecinal = observacion.getBarrio().getCentroVecinal();
        if (centroVecinal != null) {
            dto.setCentroVecinalId(centroVecinal.getId());
            dto.setCentroVecinalNombre(centroVecinal.getNombre());
        }

        List<String> imagenes = new ArrayList<>();
        for (ObservacionImagen imagen : observacion.getImagenes()) {
            imagenes.add(imagen.getRutaArchivo());
        }
        dto.setImagenes(imagenes);

        return dto;
    }
}
