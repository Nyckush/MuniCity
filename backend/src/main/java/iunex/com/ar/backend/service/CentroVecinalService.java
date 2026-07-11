package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.ActualizarCentroVecinalDTO;
import iunex.com.ar.backend.dto.CentroVecinalDTO;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;

import java.util.List;

@Service
public class CentroVecinalService {

    @Autowired
    private CentroVecinalRepository centroVecinalRepository;

    @Autowired
    private BarrioRepository barrioRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private UserRepository userRepository;

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
        centroVecinal.setFotoPerfil(normalizarTexto(dto.getFotoPerfil()));
        centroVecinal.setUbicacion(normalizarTexto(dto.getUbicacion()));
        centroVecinal.setWhatsApp(normalizarTexto(dto.getWhatsApp()));
        centroVecinal.setFacebook(normalizarTexto(dto.getFacebook()));

        return centroVecinalRepository.save(centroVecinal);
    }

    public List<CentroVecinal> obtenerTodos() {
        return centroVecinalRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CentroVecinalDTO obtenerMiCentroVecinal(Authentication authentication) {
        CentroVecinal centroVecinal = obtenerCentroVecinalDelPresidente(authentication);
        return toDto(centroVecinal);
    }

    @Transactional
    public CentroVecinalDTO actualizarMiCentroVecinal(Authentication authentication, ActualizarCentroVecinalDTO dto) {
        if (dto == null) {
            throw new RuntimeException("Los datos del centro vecinal son obligatorios.");
        }

        validarUrlOpcional(dto.getFotoPerfil(), "La foto de perfil debe ser una URL válida.");
        validarUrlOpcional(dto.getWhatsApp(), "El enlace de WhatsApp no es válido.");
        validarUrlOpcional(dto.getFacebook(), "El enlace de Facebook no es válido.");

        CentroVecinal centroVecinal = obtenerCentroVecinalDelPresidente(authentication);
        centroVecinal.setFotoPerfil(normalizarTexto(dto.getFotoPerfil()));
        centroVecinal.setUbicacion(normalizarTexto(dto.getUbicacion()));
        centroVecinal.setWhatsApp(normalizarTexto(dto.getWhatsApp()));
        centroVecinal.setFacebook(normalizarTexto(dto.getFacebook()));

        return toDto(centroVecinalRepository.save(centroVecinal));
    }

    private CentroVecinal obtenerCentroVecinalDelPresidente(Authentication authentication) {
        Ciudadano presidente = getPresidenteAutenticado(authentication);

        return centroVecinalRepository.findByPresidenteId(presidente.getId())
                .orElseThrow(() -> new RuntimeException("El presidente no tiene un centro vecinal asignado."));
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

    private void validarUrlOpcional(String valor, String mensajeError) {
        if (valor == null || valor.isBlank()) {
            return;
        }

        try {
            URI uri = URI.create(valor.trim());
            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new RuntimeException(mensajeError);
        }
    }

    private String normalizarTexto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private CentroVecinalDTO toDto(CentroVecinal centroVecinal) {
        CentroVecinalDTO dto = new CentroVecinalDTO();
        dto.setId(centroVecinal.getId());
        dto.setNombre(centroVecinal.getNombre());
        dto.setFotoPerfil(centroVecinal.getFotoPerfil());
        dto.setUbicacion(centroVecinal.getUbicacion());
        dto.setWhatsApp(centroVecinal.getWhatsApp());
        dto.setFacebook(centroVecinal.getFacebook());

        if (centroVecinal.getBarrio() != null) {
            dto.setBarrioId(centroVecinal.getBarrio().getId());
            dto.setBarrioNombre(centroVecinal.getBarrio().getNombre());
        }

        if (centroVecinal.getPresidente() != null) {
            dto.setPresidenteCiudadanoId(centroVecinal.getPresidente().getId());
            dto.setPresidenteNombreCompleto(centroVecinal.getPresidente().getNombreCompleto());
        }

        return dto;
    }
}
