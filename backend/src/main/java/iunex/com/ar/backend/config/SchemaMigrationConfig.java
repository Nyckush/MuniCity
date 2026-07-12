package iunex.com.ar.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SchemaMigrationConfig {

    @Bean
    public CommandLineRunner ensureBarrioColumns(JdbcTemplate jdbcTemplate) {
        return args -> {
            // Controlamos habitantes_estimados
            try {
                jdbcTemplate.execute("ALTER TABLE barrios ADD COLUMN habitantes_estimados INT NULL");
            } catch (Exception e) {
                // Si ya existe, MySQL lanza excepción pero la ignoramos para no romper el inicio
            }

            // Controlamos created_at
            try {
                jdbcTemplate.execute("ALTER TABLE barrios ADD COLUMN created_at DATETIME NULL");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE centros_vecinales ADD COLUMN foto_perfil VARCHAR(255) NULL");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE centros_vecinales ADD COLUMN ubicacion VARCHAR(255) NULL");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE centros_vecinales ADD COLUMN whats_app VARCHAR(255) NULL");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE centros_vecinales ADD COLUMN facebook VARCHAR(255) NULL");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE notas ADD COLUMN mostrar_ubicacion BIT NOT NULL DEFAULT b'0'");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE notas ADD COLUMN mostrar_whats_app BIT NOT NULL DEFAULT b'0'");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE notas ADD COLUMN mostrar_facebook BIT NOT NULL DEFAULT b'0'");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE notificaciones MODIFY COLUMN ciudadano_id BIGINT NULL");
            } catch (Exception e) {
                // Ignorado si ya existe o no aplica
            }

            try {
                jdbcTemplate.execute("ALTER TABLE notificaciones ADD COLUMN municipio_id BIGINT NULL");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE notificaciones ADD COLUMN comunicado_municipal_id BIGINT NULL");
            } catch (Exception e) {
                // Ignorado si ya existe
            }

            try {
                jdbcTemplate.execute("ALTER TABLE notificaciones MODIFY COLUMN tipo VARCHAR(50) NOT NULL");
            } catch (Exception e) {
                // Ignorado si no aplica
            }

            try {
                jdbcTemplate.execute("""
                        CREATE TABLE comunicados_municipales (
                            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                            municipio_id BIGINT NOT NULL,
                            barrio_id BIGINT NULL,
                            titulo VARCHAR(255) NOT NULL,
                            contenido TEXT NOT NULL,
                            imagen_portada VARCHAR(255) NULL,
                            estado VARCHAR(50) NOT NULL,
                            fecha_publicacion DATETIME NULL,
                            es_global BIT NOT NULL DEFAULT b'0',
                            destacado BIT NOT NULL DEFAULT b'0',
                            created_at DATETIME NULL,
                            updated_at DATETIME NULL
                        )
                        """);
            } catch (Exception e) {
                // Ignorado si ya existe
            }
        };
    }
}
