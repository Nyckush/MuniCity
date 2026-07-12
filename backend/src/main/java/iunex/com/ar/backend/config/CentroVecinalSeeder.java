package iunex.com.ar.backend.config;

import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@Order(2)
public class CentroVecinalSeeder implements CommandLineRunner {

    private final BarrioRepository barrioRepository;
    private final CentroVecinalRepository centroVecinalRepository;
    private final CiudadanoRepository ciudadanoRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CentroVecinalSeeder(
            BarrioRepository barrioRepository,
            CentroVecinalRepository centroVecinalRepository,
            CiudadanoRepository ciudadanoRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.barrioRepository = barrioRepository;
        this.centroVecinalRepository = centroVecinalRepository;
        this.ciudadanoRepository = ciudadanoRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private record SeedData(
            String barrioNombre,
            String centroVecinalNombre,
            String email,
            String username,
            String password,
            String role,
            String nombreCompleto,
            String apellido,
            String dni,
            LocalDate fechaNacimiento
    ) {}

    @Override
    @Transactional
    public void run(String... args) {
        List<SeedData> seedData = List.of(
                new SeedData("Centro", "Centro Vecinal Centro", "bruno.vilca@municity.com", "presidente", "asdasdasd", "ROLE_PRESIDENTE", "Bruno Ariel", "Vilca", "30111222", LocalDate.of(1988, 4, 12)),
                new SeedData("Centro", "Centro Vecinal Centro", "milagro.mamani@municity.com", "vecino", "asdasdasd", "ROLE_CIUDADANO", "Milagro Belen", "Mamani", "28999111", LocalDate.of(1992, 9, 3)),
                new SeedData("Ciudad de Nieva", "Centro Vecinal Ciudad de Nieva", "carolina.quispe@municity.com", "carolina.quispe", "Vecino123", "ROLE_CIUDADANO", "Carolina Soledad", "Quispe", "31222333", LocalDate.of(1990, 1, 21)),
                new SeedData("Alto Comedero", "Centro Vecinal Alto Comedero", "sergio.condori@municity.com", "sergio.condori", "Vecino123", "ROLE_CIUDADANO", "Sergio Daniel", "Condori", "27666777", LocalDate.of(1983, 6, 17))
        );

        for (SeedData data : seedData) {
            Barrio barrio = barrioRepository.findByNombre(data.barrioNombre()).orElse(null);

            if (barrio == null) {
                continue;
            }

            User user = userRepository.findByEmail(data.email()).orElseGet(User::new);
            user.setEmail(data.email());
            user.setUsername(data.username());
            user.setPassword(passwordEncoder.encode(data.password()));
            user.setRole(data.role());
            user = userRepository.save(user);

            Ciudadano ciudadano = ciudadanoRepository.findByDni(data.dni()).orElseGet(Ciudadano::new);
            ciudadano.setNombreCompleto(data.nombreCompleto());
            ciudadano.setApellido(data.apellido());
            ciudadano.setDni(data.dni());
            ciudadano.setFechaNacimiento(data.fechaNacimiento());
            ciudadano.setBarrio(barrio);
            ciudadano.setUser(user);
            ciudadano = ciudadanoRepository.save(ciudadano);

            CentroVecinal centroVecinal = centroVecinalRepository.findByBarrioId(barrio.getId()).orElseGet(CentroVecinal::new);
            centroVecinal.setNombre(data.centroVecinalNombre().trim().toUpperCase());
            centroVecinal.setBarrio(barrio);
            centroVecinal.setPresidente(ciudadano);
            centroVecinalRepository.save(centroVecinal);
        }

        System.out.println("🌱 Base de datos sincronizada: Centros vecinales iniciales listos.");
    }
}
