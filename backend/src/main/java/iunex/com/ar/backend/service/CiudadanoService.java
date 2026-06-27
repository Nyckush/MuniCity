package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.RegistroCiudadanoDTO;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Transactional
    public void registrarCiudadano(RegistroCiudadanoDTO dto) {

        // 1. Validaciones previas
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo electrónico ya está registrado.");
        }

        if (ciudadanoRepository.existsByDni(dto.getDni())) {
            throw new RuntimeException("El DNI ya está registrado en el sistema.");
        }

        // 2. Buscar si el barrio elegido en el Select realmente existe
        Barrio barrio = barrioRepository.findById(dto.getBarrioId())
                .orElseThrow(() -> new RuntimeException("El barrio seleccionado no existe."));

        // 3. Crear y guardar el USUARIO (La cuenta de acceso)
        User usuario = new User();
        usuario.setEmail(dto.getEmail());

        // NOTA: Por ahora va en texto plano. Cuando agregues Spring Security,
        // acá usarás passwordEncoder.encode(dto.getPassword())
        usuario.setPassword(dto.getPassword());
        usuario.setRole("ROLE_CIUDADANO"); // Rol por defecto

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
}