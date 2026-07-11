package iunex.com.ar.backend.config;

import iunex.com.ar.backend.model.Municipio;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.MunicipioRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class MunicipioSeeder {

    private static final String MUNICIPIO_EMAIL = "municipio@municity.com";
    private static final String MUNICIPIO_USERNAME = "muni";
    private static final String MUNICIPIO_PASSWORD = "asdasdasd";
    private static final String MUNICIPIO_NOMBRE = "Municipalidad de San Salvador de Jujuy";

    @Order(3)
    @Bean
    public CommandLineRunner seedMunicipio(
            UserRepository userRepository,
            MunicipioRepository municipioRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            User user = userRepository.findByEmail(MUNICIPIO_EMAIL)
                    .orElseGet(User::new);

            user.setEmail(MUNICIPIO_EMAIL);
            user.setUsername(MUNICIPIO_USERNAME);
            user.setPassword(passwordEncoder.encode(MUNICIPIO_PASSWORD));
            user.setRole("ROLE_MUNICIPIO");

            User savedUser = userRepository.save(user);

            Municipio municipio = municipioRepository.findByUserId(savedUser.getId())
                    .orElseGet(Municipio::new);

            municipio.setNombre(MUNICIPIO_NOMBRE);
            municipio.setUser(savedUser);

            municipioRepository.save(municipio);

            System.out.println("🌱 Base de datos sincronizada: Municipio inicial listo para iniciar sesión.");
        };
    }
}
