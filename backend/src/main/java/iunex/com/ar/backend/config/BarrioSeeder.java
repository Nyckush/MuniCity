package iunex.com.ar.backend.config;

import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.repository.BarrioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class BarrioSeeder {

    @Bean
    public CommandLineRunner seedBarrios(BarrioRepository barrioRepository) {
        return args -> {
            // Verificamos si ya existen barrios para no duplicar datos en modo 'update'
            if (barrioRepository.count() == 0) {

                // Crear Barrio 1
                Barrio b1 = new Barrio();
                b1.setNombre("Centro");
                b1.setHabitantesEstimados(15000);

                // Crear Barrio 2
                Barrio b2 = new Barrio();
                b2.setNombre("San Pedrito");
                b2.setHabitantesEstimados(28000);

                // Crear Barrio 3
                Barrio b3 = new Barrio();
                b3.setNombre("Ciudad de Nieva");
                b3.setHabitantesEstimados(12000);

                // Crear Barrio 4
                Barrio b4 = new Barrio();
                b4.setNombre("Alto Comedero");
                b4.setHabitantesEstimados(85000);

                // Guardamos la lista completa en la Base de Datos
                barrioRepository.saveAll(List.of(b1, b2, b3, b4));

                System.out.println("🌱 Base de datos sembrada: Se agregaron los barrios iniciales.");
            } else {
                System.out.println("✨ La tabla 'barrios' ya contiene datos. Se omitió el sembrado.");
            }
        };
    }
}