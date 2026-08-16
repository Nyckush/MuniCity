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
import java.util.Map;

@Component
@Order(5)
public class NotasSeeder implements CommandLineRunner {

    private record NoteTemplate(
            String tituloBase,
            CategoriaNota categoria,
            String introduccion,
            String diagnostico,
            String propuesta,
            String cierre
    ) {}

    private static final List<NoteTemplate> NOTE_TEMPLATES = List.of(
            new NoteTemplate(
                    "Plan de mejoras urbanas en %s",
                    CategoriaNota.PROPUESTA,
                    "Desde el centro vecinal proponemos un plan integral de mejoras urbanas para el barrio %s, con el objetivo de ordenar intervenciones prioritarias y dar respuesta a reclamos que vienen siendo reiterados por vecinos y vecinas en reuniones comunitarias.",
                    "Durante los ultimos meses se relevaron veredas con roturas, sectores con iluminacion insuficiente, cruces peatonales sin demarcacion visible y espacios de uso comun que necesitan reacondicionamiento para garantizar una circulacion mas segura.",
                    "La propuesta contempla una primera etapa de reparacion de veredas, reposicion de luminarias, pintura de sendas peatonales y colocacion de cestos en puntos estrategicos. En una segunda etapa se sugiere sumar bancos, tareas de forestacion y mejoras en plazas o espacios barriales de encuentro.",
                    "Solicitamos que esta nota sea considerada dentro de la planificacion municipal para definir un cronograma de trabajo conjunto con el centro vecinal, priorizando las cuadras mas transitadas y los sectores donde viven personas mayores, ninos y familias con mayores dificultades de movilidad."
            ),
            new NoteTemplate(
                    "Agenda cultural y comunitaria de %s",
                    CategoriaNota.COMUNICADO,
                    "Compartimos una propuesta de agenda cultural y comunitaria para el barrio %s, pensada para fortalecer la participacion vecinal y recuperar espacios comunes con actividades abiertas, accesibles y sostenidas en el tiempo.",
                    "En encuentros recientes surgio la necesidad de generar mas instancias de integracion entre familias, juventudes, personas mayores, emprendedores locales y organizaciones barriales, especialmente durante fines de semana y fechas conmemorativas.",
                    "La iniciativa incluye talleres recreativos, ferias de emprendedores, cine o musica al aire libre, jornadas de lectura, actividades deportivas comunitarias y acciones articuladas con escuelas, clubes o instituciones cercanas para ampliar la convocatoria.",
                    "Proponemos trabajar esta agenda junto al municipio para ordenar permisos, definir necesidades logisticas y construir un calendario semestral que le de continuidad, visibilidad y valor comunitario a las actividades desarrolladas en el barrio."
            ),
            new NoteTemplate(
                    "Programa de seguridad y limpieza para %s",
                    CategoriaNota.RECLAMO,
                    "Presentamos esta nota para solicitar el refuerzo del programa de seguridad preventiva y limpieza urbana en el barrio %s, a partir de situaciones observadas por residentes y referentes comunitarios durante las ultimas semanas.",
                    "Se detectaron microbasurales en esquinas recurrentes, acumulacion de restos verdes y residuos voluminosos, ademas de calles con baja visibilidad nocturna y sectores donde vecinos manifiestan preocupacion por hechos de vandalismo o circulacion insegura.",
                    "Solicitamos incrementar la frecuencia de limpieza en puntos criticos, coordinar operativos especiales para retiro de residuos no convencionales, revisar luminarias fuera de servicio y reforzar recorridos preventivos en horarios de mayor circulacion peatonal.",
                    "Consideramos importante complementar estas acciones con una instancia de seguimiento entre municipio y centro vecinal, de modo que los avances puedan verificarse en territorio y se mantenga una respuesta sostenida sobre los sectores mas sensibles del barrio."
            )
    );

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
        List<Barrio> barrios = barrioRepository.findAll().stream()
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
                .collect(java.util.stream.Collectors.toMap(
                        Ciudadano::getId,
                        ciudadano -> ciudadano,
                        (first, second) -> first
                ))
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

        Map<String, Nota> existingNotesByTitle = notaRepository.findAll().stream()
                .filter(nota -> nota.getCentroVecinal().getId().equals(centroVecinal.getId()))
                .collect(java.util.stream.Collectors.toMap(
                        Nota::getTitulo,
                        nota -> nota,
                        (first, second) -> first
                ));

        for (int index = 0; index < NOTE_TEMPLATES.size(); index++) {
            NoteTemplate template = NOTE_TEMPLATES.get(index);
            String titulo = template.tituloBase().formatted(barrio.getNombre());

            Nota existente = existingNotesByTitle.get(titulo);
            if (existente != null) {
                notas.add(existente);
                continue;
            }

            Nota nota = new Nota();
            nota.setCentroVecinal(centroVecinal);
            nota.setAutor(centroVecinal.getPresidente());
            nota.setTitulo(titulo);
            nota.setContenido(buildNoteContent(barrio, template, barrioIndex, index));
            nota.setCategoria(template.categoria());
            nota.setEstado(EstadoNota.ENTREGADO);
            nota.setMotivoEstado(null);
            nota.setMostrarUbicacion(true);
            nota.setMostrarWhatsApp(true);
            nota.setMostrarFacebook(true);
            notas.add(notaRepository.save(nota));
        }

        return notas;
    }

    private String buildNoteContent(Barrio barrio, NoteTemplate template, int barrioIndex, int templateIndex) {
        int prioridad = barrioIndex + templateIndex + 1;

        return """
                <p>%s</p>
                <p>%s</p>
                <p>%s</p>
                <p>%s</p>
                <p><strong>Prioridad barrial:</strong> eje de trabajo %d para %s.</p>
                """.formatted(
                template.introduccion().formatted(barrio.getNombre()),
                template.diagnostico(),
                template.propuesta(),
                template.cierre(),
                prioridad,
                barrio.getNombre()
        );
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
