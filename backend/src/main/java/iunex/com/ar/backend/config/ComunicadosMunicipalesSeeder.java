package iunex.com.ar.backend.config;

import iunex.com.ar.backend.model.ComunicadoMunicipal;
import iunex.com.ar.backend.model.EstadoComunicadoMunicipal;
import iunex.com.ar.backend.model.Municipio;
import iunex.com.ar.backend.repository.ComunicadoMunicipalRepository;
import iunex.com.ar.backend.repository.MunicipioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(6)
public class ComunicadosMunicipalesSeeder implements CommandLineRunner {

    private final ComunicadoMunicipalRepository comunicadoMunicipalRepository;
    private final MunicipioRepository municipioRepository;

    public ComunicadosMunicipalesSeeder(
            ComunicadoMunicipalRepository comunicadoMunicipalRepository,
            MunicipioRepository municipioRepository
    ) {
        this.comunicadoMunicipalRepository = comunicadoMunicipalRepository;
        this.municipioRepository = municipioRepository;
    }

    private record SeedData(
            String titulo,
            String contenido,
            String imagenPortada,
            boolean destacado
    ) {}

    @Override
    @Transactional
    public void run(String... args) {
        Municipio municipio = municipioRepository.findAll().stream().findFirst().orElse(null);

        if (municipio == null || municipio.getId() == null) {
            return;
        }

        List<SeedData> seedData = List.of(
                new SeedData(
                        "Torneo de Futbol",
                        "La Municipalidad invita a toda la comunidad a participar del Torneo de Futbol barrial. Habrá equipos invitados, actividades recreativas y espacios para compartir en familia durante toda la jornada.",
                        "https://i.pinimg.com/1200x/34/84/96/348496a7ac30d329613b43c54fcccc29.jpg",
                        true
                ),
                new SeedData(
                        "Curso de Electricidad",
                        "Se abre la inscripción al nuevo Curso de Electricidad orientado a jóvenes y adultos del municipio. La propuesta busca fortalecer la formación en oficios con salida laboral y prácticas guiadas.",
                        "https://i.pinimg.com/736x/8d/28/d7/8d28d7a64cc705e03d32a7d5b4d269d2.jpg",
                        false
                ),
                new SeedData(
                        "Concurso de Perros",
                        "La Municipalidad organiza un Concurso de Perros para promover el cuidado responsable de las mascotas y generar un encuentro comunitario con actividades, premios y stands informativos.",
                        "https://i.pinimg.com/736x/10/03/3d/10033d91b367dd7aae0b23e1a2681707.jpg",
                        false
                )
        );

        for (int index = 0; index < seedData.size(); index++) {
            SeedData data = seedData.get(index);

            if (comunicadoMunicipalRepository.existsByMunicipioIdAndTitulo(municipio.getId(), data.titulo())) {
                continue;
            }

            ComunicadoMunicipal comunicado = new ComunicadoMunicipal();
            comunicado.setMunicipio(municipio);
            comunicado.setBarrio(null);
            comunicado.setTitulo(data.titulo());
            comunicado.setContenido(data.contenido());
            comunicado.setImagenPortada(data.imagenPortada());
            comunicado.setEstado(EstadoComunicadoMunicipal.PUBLICADO);
            comunicado.setFechaPublicacion(LocalDateTime.now().minusDays(seedData.size() - index));
            comunicado.setEsGlobal(true);
            comunicado.setDestacado(data.destacado());

            comunicadoMunicipalRepository.save(comunicado);
        }

        System.out.println("🌱 Base de datos sincronizada: Comunicados municipales de ejemplo listos.");
    }
}
