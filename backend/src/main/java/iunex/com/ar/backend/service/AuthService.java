package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.AuthResponseDTO;
import iunex.com.ar.backend.dto.LoginRequestDTO;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.Municipio;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.MunicipioRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private MunicipioRepository municipioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private boolean isCitizenRole(String role) {
        return "ROLE_CIUDADANO".equals(role) || "ROLE_PRESIDENTE".equals(role);
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO dto) {
        if (dto == null || dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new RuntimeException("El correo electrónico es obligatorio.");
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new RuntimeException("La contraseña es obligatoria.");
        }

        String emailNormalizado = dto.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(emailNormalizado)
                .orElseThrow(() -> new RuntimeException("Correo o contraseña incorrectos."));

        if (!passwordMatches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Correo o contraseña incorrectos.");
        }

        migrateLegacyPasswordIfNeeded(user, dto.getPassword());

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        Instant expiration = jwtService.extractExpiration(token);

        AuthResponseDTO response = buildAuthResponse(user);
        response.setToken(token);
        response.setExpiresAt(expiration.toEpochMilli());
        response.setMessage("Inicio de sesión exitoso.");

        return response;
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No hay una sesión autenticada.");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));

        return buildAuthResponse(user);
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null || storedPassword.isBlank()) {
            return false;
        }

        try {
            return passwordEncoder.matches(rawPassword, storedPassword);
        } catch (IllegalArgumentException exception) {
            return rawPassword.equals(storedPassword);
        }
    }

    private void migrateLegacyPasswordIfNeeded(User user, String rawPassword) {
        String storedPassword = user.getPassword();

        if (storedPassword != null && storedPassword.startsWith("$2")) {
            return;
        }

        if (rawPassword.equals(storedPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        }
    }

    private AuthResponseDTO buildAuthResponse(User user) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        if (isCitizenRole(user.getRole())) {
            Ciudadano ciudadano = ciudadanoRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."));

            response.setCiudadanoId(ciudadano.getId());
            response.setNombreCompleto(ciudadano.getNombreCompleto());
            response.setApellido(ciudadano.getApellido());
            response.setBarrioId(ciudadano.getBarrio().getId());
            response.setBarrioNombre(ciudadano.getBarrio().getNombre());
            return response;
        }

        if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            Municipio municipio = municipioRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("No se encontró un perfil de municipio asociado."));

            response.setMunicipioId(municipio.getId());
            response.setMunicipioNombre(municipio.getNombre());
            response.setNombreCompleto(municipio.getNombre());
            return response;
        }

        throw new RuntimeException("El rol del usuario no está soportado por el sistema.");
    }
}
