package iunex.com.ar.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Desactivar por completo CSRF (esencial para que Postman pueda hacer POST/PUT/DELETE)
                .csrf(csrf -> csrf.disable())

                // 2. Desactivar CORS temporalmente para evitar bloqueos con el navegador
                .cors(cors -> cors.disable())

                // 3. Decirle a Spring que no guarde sesiones en el servidor (las APIs REST son Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Configurar los accesos a las rutas
                .authorizeHttpRequests(auth -> auth
                        // Permite cualquier petición (GET, POST, etc.) que empiece con /api/
                        .requestMatchers("/api/**").permitAll()
                        // Cualquier otra ruta del sistema requerirá autenticación
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}