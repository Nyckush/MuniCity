package iunex.com.ar.backend.config;

import iunex.com.ar.backend.model.ApoyoNota;
import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.CategoriaNota;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.EstadoNota;
import iunex.com.ar.backend.model.Nota;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.ApoyoNotaRepository;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.NotaRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Component
@Order(5)
public class NotasSeeder implements CommandLineRunner {

    private final BarrioRepository barrioRepository;
    private final CentroVecinalRepository centroVecinalRepository;
    private final CiudadanoRepository ciudadanoRepository;
    private final UserRepository userRepository;
    private final NotaRepository notaRepository;
    private final ApoyoNotaRepository apoyoNotaRepository;
    private final PasswordEncoder passwordEncoder;

    public NotasSeeder(
            BarrioRepository barrioRepository,
            CentroVecinalRepository centroVecinalRepository,
            CiudadanoRepository ciudadanoRepository,
            UserRepository userRepository,
            NotaRepository notaRepository,
            ApoyoNotaRepository apoyoNotaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.barrioRepository = barrioRepository;
        this.centroVecinalRepository = centroVecinalRepository;
        this.ciudadanoRepository = ciudadanoRepository;
        this.userRepository = userRepository;
        this.notaRepository = notaRepository;
        this.apoyoNotaRepository = apoyoNotaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<Barrio> barrios = barrioRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Barrio::getNombre))
                .toList();

        if (barrios.isEmpty()) {
            return;
        }

        List<Ciudadano> ciudadanosGlobales = new ArrayList<>();
        List<Nota> notasCreadas = new ArrayList<>();

        for (int barrioIndex = 0; barrioIndex < barrios.size(); barrioIndex++) {
            Barrio barrio = barrios.get(barrioIndex);
            CentroVecinal centroVecinal = centroVecinalRepository.findByBarrioId(barrio.getId()).orElse(null);

            if (centroVecinal == null || centroVecinal.getPresidente() == null) {
                continue;
            }

            List<Ciudadano> ciudadanosDelBarrio = ensureCitizensForNeighborhood(barrio);
            ciudadanosGlobales.addAll(ciudadanosDelBarrio);
            notasCreadas.addAll(ensureNotesForNeighborhood(barrio, centroVecinal, barrioIndex));
        }

        if (notasCreadas.isEmpty() || ciudadanosGlobales.isEmpty()) {
            return;
        }

        List<Ciudadano> ciudadanosSinDuplicados = ciudadanosGlobales.stream()
                .collect(java.util.stream.Collectors.toMap(Ciudadano::getId, ciudadano -> ciudadano, (first, second) -> first))
                .values()
                .stream()
                .sorted(Comparator.comparing(Ciudadano::getId))
                .toList();

        for (int noteIndex = 0; noteIndex < notasCreadas.size(); noteIndex++) {
            Nota nota = notasCreadas.get(noteIndex);
            int targetSupport = Math.min(
                    ciudadanosSinDuplicados.size(),
                    Math.max(4, ciudadanosSinDuplicados.size() - (noteIndex * 2))
            );

            for (int offset = 0; offset < targetSupport; offset++) {
                Ciudadano ciudadano = ciudadanosSinDuplicados.get((noteIndex + offset) % ciudadanosSinDuplicados.size());

                if (apoyoNotaRepository.existsByCiudadanoIdAndNotaId(ciudadano.getId(), nota.getId())) {
                    continue;
                }

                ApoyoNota apoyoNota = new ApoyoNota();
                apoyoNota.setCiudadano(ciudadano);
                apoyoNota.setNota(nota);
                apoyoNotaRepository.save(apoyoNota);
            }
        }

        System.out.println("🌱 Notas y apoyos cargados para todos los barrios actuales.");
    }

    private List<Ciudadano> ensureCitizensForNeighborhood(Barrio barrio) {
        int citizensToCreate = "Centro".equalsIgnoreCase(barrio.getNombre()) ? 0 : 8;
        String barrioSlug = slugify(barrio.getNombre());

        for (int index = 1; index <= citizensToCreate; index++) {
            String suffix = String.format("%02d", index);
            String email = "vecino." + barrioSlug + "." + suffix + "@municity.com";
            String dni = "45" + String.format("%03d", barrio.getId()) + String.format("%03d", index);

            User user = userRepository.findByEmail(email).orElseGet(User::new);
            user.setEmail(email);
            user.setUsername("vecino-" + barrioSlug + "-" + suffix);
            user.setPassword(passwordEncoder.encode("Vecino123"));
            user.setRole("ROLE_CIUDADANO");
            user = userRepository.save(user);

            Ciudadano ciudadano = ciudadanoRepository.findByDni(dni).orElseGet(Ciudadano::new);
            ciudadano.setNombreCompleto("Vecino " + barrio.getNombre() + " " + suffix);
            ciudadano.setApellido("Barrio" + suffix);
            ciudadano.setDni(dni);
            ciudadano.setFechaNacimiento(LocalDate.of(1986, 1, 1).plusDays((barrio.getId() * 17) + index * 29L));
            ciudadano.setBarrio(barrio);
            ciudadano.setUser(user);
            ciudadanoRepository.save(ciudadano);
        }

        return ciudadanoRepository.findAllByBarrioIdOrderByIdAsc(barrio.getId());
    }

    private List<Nota> ensureNotesForNeighborhood(Barrio barrio, CentroVecinal centroVecinal, int barrioIndex) {
        List<Nota> notas = new ArrayList<>();

        Object[][] templates = {
                {
                        "Plan de mejoras urbanas en " + barrio.getNombre(),
                        "Se propone priorizar veredas, luminarias y puntos de encuentro para fortalecer la vida cotidiana del barrio.",
                        CategoriaNota.PROPUESTA
                },
                {
                        "Agenda cultural y comunitaria de " + barrio.getNombre(),
                        "La propuesta incluye talleres abiertos, ferias vecinales y actividades intergeneracionales para activar la participación.",
                        CategoriaNota.COMUNICADO
                },
                {
                        "Programa de seguridad y limpieza para " + barrio.getNombre(),
                        "La nota plantea reforzar recorridos preventivos, limpieza de espacios comunes y un canal de seguimiento barrial.",
                        CategoriaNota.RECLAMO
                }
        };

        for (int index = 0; index < templates.length; index++) {
            String titulo = (String) templates[index][0];
            String contenido = (String) templates[index][1];
            CategoriaNota categoria = (CategoriaNota) templates[index][2];

            if (notaRepository.existsByCentroVecinalIdAndTitulo(centroVecinal.getId(), titulo)) {
                Nota existente = notaRepository.findAll().stream()
                        .filter(nota -> nota.getCentroVecinal().getId().equals(centroVecinal.getId()) && titulo.equals(nota.getTitulo()))
                        .findFirst()
                        .orElse(null);

                if (existente != null) {
                    notas.add(existente);
                }
                continue;
            }

            Nota nota = new Nota();
            nota.setCentroVecinal(centroVecinal);
            nota.setAutor(centroVecinal.getPresidente());
            nota.setTitulo(titulo);
            nota.setContenido(contenido + " Prioridad temática #" + (barrioIndex + index + 1) + ".");
            nota.setCategoria(categoria);
            nota.setEstado(EstadoNota.ENTREGADO);
            nota.setMotivoEstado(null);
            notas.add(notaRepository.save(nota));
        }

        return notas;
    }

    private String slugify(String value) {
        return value
                .toLowerCase(Locale.ROOT)
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u")
                .replace("ñ", "n")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
