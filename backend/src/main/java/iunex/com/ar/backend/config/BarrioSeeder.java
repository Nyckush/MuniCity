package iunex.com.ar.backend.config;

import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.repository.BarrioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class BarrioSeeder {

    private static Barrio createBarrio(String nombre, int habitantesEstimados) {
        Barrio barrio = new Barrio();
        barrio.setNombre(nombre);
        barrio.setHabitantesEstimados(habitantesEstimados);
        return barrio;
    }

    @Order(1)
    @Bean
    public CommandLineRunner seedBarrios(BarrioRepository barrioRepository) {
        return args -> {
            // Verificamos si ya existen barrios para no duplicar datos en modo 'update'
            if (barrioRepository.count() == 0) {

                // Guardamos la lista completa en la Base de Datos
                barrioRepository.saveAll(List.of(
                    createBarrio("Almirante Brown", 14000),
                    createBarrio("Alto Comedero", 85000),
                    createBarrio("Alto Gorriti", 12500),
                    createBarrio("Alto La Vina", 9000),
                    createBarrio("Alto Padilla", 7600),
                    createBarrio("Bajo La Vina", 8800),
                    createBarrio("Campo Verde", 16800),
                    createBarrio("Centro", 15000),
                    createBarrio("Chijra", 13200),
                    createBarrio("Ciudad de Nieva", 12000),
                    createBarrio("Coronel E. Arias", 11400),
                    createBarrio("Cuyaya", 13600),
                    createBarrio("El Arenal", 9700),
                    createBarrio("Lujan", 10800),
                    createBarrio("Los Huaicos", 11900),
                    createBarrio("Los Perales", 14300),
                    createBarrio("Malvinas Argentinas", 26500),
                    createBarrio("Marcelino Vargas", 9100),
                    createBarrio("Mariano Moreno", 15100),
                    createBarrio("Nueve de Julio", 8200),
                    createBarrio("Punta Diamante", 11100),
                    createBarrio("San Francisco de Alava", 19400),
                    createBarrio("San Guillermo", 8700),
                    createBarrio("San Pedrito", 28000),
                    createBarrio("San Salvador de Velazco", 7400),
                    createBarrio("Villa Belgrano", 9800),
                    createBarrio("Villa San Martin", 10200),
                    createBarrio("En El Valle de Jujuy", 6800)
                ));

                System.out.println("🌱 Base de datos sembrada: Se agregaron los barrios iniciales.");
            } else {
                System.out.println("✨ La tabla 'barrios' ya contiene datos. Se omitió el sembrado.");
            }
        };
    }
}
