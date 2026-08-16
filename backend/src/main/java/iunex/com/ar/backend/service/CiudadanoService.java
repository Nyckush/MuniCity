package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.ActualizarPerfilCiudadanoDTO;
import iunex.com.ar.backend.dto.AuthResponseDTO;
import iunex.com.ar.backend.dto.RegistroCiudadanoDTO;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CiudadanoService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private BarrioRepository barrioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Transactional
    public void registrarCiudadano(RegistroCiudadanoDTO dto) {
        if (dto.getUsername() == null) {
            throw new RuntimeException("El username es obligatorio.");
        }

        String emailNormalizado = dto.getEmail().trim().toLowerCase();
        String usernameNormalizado = dto.getUsername().trim();

        // 1. Validaciones previas
        if (userRepository.existsByEmail(emailNormalizado)) {
            throw new RuntimeException("El correo electrónico ya está registrado.");
        }

        if (usernameNormalizado.isBlank()) {
            throw new RuntimeException("El username es obligatorio.");
        }

        if (userRepository.existsByUsernameIgnoreCase(usernameNormalizado)) {
            throw new RuntimeException("El username ya está registrado.");
        }

        if (ciudadanoRepository.existsByDni(dto.getDni())) {
            throw new RuntimeException("El DNI ya está registrado en el sistema.");
        }

        // 2. Buscar si el barrio elegido en el Select realmente existe
        Barrio barrio = barrioRepository.findById(dto.getBarrioId())
                .orElseThrow(() -> new RuntimeException("El barrio seleccionado no existe."));

        // 3. Crear y guardar el USUARIO (La cuenta de acceso)
        User usuario = new User();
        usuario.setEmail(emailNormalizado);
        usuario.setUsername(usernameNormalizado);
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRole("ROLE_CIUDADANO"); // Rol por defecto
        usuario.setFotoPerfil(normalizeOptionalValue(dto.getFotoPerfil()));

        // Guardamos el usuario. JPA automáticamente le genera el ID y nos devuelve el objeto actualizado
        User usuarioGuardado = userRepository.save(usuario);

        // 4. Crear y guardar el CIUDADANO (El perfil)
        Ciudadano ciudadano = new Ciudadano();
        ciudadano.setNombreCompleto(dto.getNombreCompleto());
        ciudadano.setApellido(dto.getApellido());
        ciudadano.setDni(dto.getDni());
        ciudadano.setFechaNacimiento(dto.getFechaNacimiento());

        // Seteamos las relaciones usando los objetos completos
        ciudadano.setUser(usuarioGuardado);
        ciudadano.setBarrio(barrio);

        // Guardamos el ciudadano finalizando el proceso
        ciudadanoRepository.save(ciudadano);
    }

    @Transactional
    public AuthResponseDTO actualizarPerfil(Authentication authentication, ActualizarPerfilCiudadanoDTO dto) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No hay una sesión autenticada.");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));

        Ciudadano ciudadano = ciudadanoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."));

        String emailNormalizado = dto.getEmail() == null ? "" : dto.getEmail().trim().toLowerCase();
        String usernameNormalizado = dto.getUsername() == null ? "" : dto.getUsername().trim();
        String dniNormalizado = dto.getDni() == null ? "" : dto.getDni().trim();

        if (emailNormalizado.isBlank()) {
            throw new RuntimeException("El correo electrónico es obligatorio.");
        }

        if (usernameNormalizado.isBlank()) {
            throw new RuntimeException("El username es obligatorio.");
        }

        if (dniNormalizado.isBlank()) {
            throw new RuntimeException("El DNI es obligatorio.");
        }

        userRepository.findByEmailIgnoreCase(emailNormalizado)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("El correo electrónico ya está registrado.");
                });

        userRepository.findByUsernameIgnoreCase(usernameNormalizado)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("El username ya está registrado.");
                });

        ciudadanoRepository.findByDni(dniNormalizado)
                .filter(existing -> !existing.getId().equals(ciudadano.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("El DNI ya está registrado en el sistema.");
                });

        Barrio barrio = barrioRepository.findById(dto.getBarrioId())
                .orElseThrow(() -> new RuntimeException("El barrio seleccionado no existe."));

        ciudadano.setNombreCompleto(dto.getNombreCompleto());
        ciudadano.setApellido(dto.getApellido());
        ciudadano.setDni(dniNormalizado);
        ciudadano.setFechaNacimiento(dto.getFechaNacimiento());
        ciudadano.setBarrio(barrio);
        user.setEmail(emailNormalizado);
        user.setUsername(usernameNormalizado);
        user.setFotoPerfil(normalizeOptionalValue(dto.getFotoPerfil()));

        User updatedUser = userRepository.save(user);
        ciudadanoRepository.save(ciudadano);
        return authService.issueSessionForUser(updatedUser);
    }

    private String normalizeOptionalValue(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
