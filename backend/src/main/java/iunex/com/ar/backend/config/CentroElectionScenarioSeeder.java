package iunex.com.ar.backend.config;

import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.model.Candidatura;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.Eleccion;
import iunex.com.ar.backend.model.EstadoEleccion;
import iunex.com.ar.backend.model.EstadoValidacionCandidatura;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.model.Voto;
import iunex.com.ar.backend.repository.BarrioRepository;
import iunex.com.ar.backend.repository.CandidaturaRepository;
import iunex.com.ar.backend.repository.CentroVecinalRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.EleccionRepository;
import iunex.com.ar.backend.repository.UserRepository;
import iunex.com.ar.backend.repository.VotoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(4)
public class CentroElectionScenarioSeeder implements CommandLineRunner {

    private final BarrioRepository barrioRepository;
    private final CentroVecinalRepository centroVecinalRepository;
    private final CiudadanoRepository ciudadanoRepository;
    private final UserRepository userRepository;
    private final EleccionRepository eleccionRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final VotoRepository votoRepository;
    private final PasswordEncoder passwordEncoder;

    public CentroElectionScenarioSeeder(
            BarrioRepository barrioRepository,
            CentroVecinalRepository centroVecinalRepository,
            CiudadanoRepository ciudadanoRepository,
            UserRepository userRepository,
            EleccionRepository eleccionRepository,
            CandidaturaRepository candidaturaRepository,
            VotoRepository votoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.barrioRepository = barrioRepository;
        this.centroVecinalRepository = centroVecinalRepository;
        this.ciudadanoRepository = ciudadanoRepository;
        this.userRepository = userRepository;
        this.eleccionRepository = eleccionRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.votoRepository = votoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Barrio barrioCentro = barrioRepository.findByNombre("Centro").orElse(null);

        if (barrioCentro == null) {
            return;
        }

        CentroVecinal centroVecinal = centroVecinalRepository.findByBarrioId(barrioCentro.getId()).orElse(null);

        if (centroVecinal == null) {
            return;
        }

        List<Ciudadano> ciudadanosCentro = new ArrayList<>();

        Ciudadano presidenteActual = centroVecinal.getPresidente();
        if (presidenteActual != null) {
            ciudadanosCentro.add(presidenteActual);
        }

        for (int index = 1; index <= 39; index++) {
            String numero = String.format("%02d", index);
            String email = "centro.vecino" + numero + "@municity.com";
            String dni = "4000" + String.format("%04d", index);

            User user = userRepository.findByEmail(email).orElseGet(User::new);
            user.setEmail(email);
            user.setUsername("centro-vecino-" + numero);
            user.setPassword(passwordEncoder.encode("Vecino123"));
            user.setRole("ROLE_CIUDADANO");
            user = userRepository.save(user);

            Ciudadano ciudadano = ciudadanoRepository.findByDni(dni).orElseGet(Ciudadano::new);
            ciudadano.setNombreCompleto("Vecino Centro " + numero);
            ciudadano.setApellido("Centro" + numero);
            ciudadano.setDni(dni);
            ciudadano.setFechaNacimiento(LocalDate.of(1985, 1, 1).plusDays(index * 37L));
            ciudadano.setBarrio(barrioCentro);
            ciudadano.setUser(user);
            ciudadanosCentro.add(ciudadanoRepository.save(ciudadano));
        }

        if (ciudadanosCentro.size() < 40) {
            return;
        }

        if (!eleccionRepository.findByCentroVecinalBarrioIdOrderByFechaInicioPostulacionDesc(barrioCentro.getId()).isEmpty()) {
            System.out.println("✨ Escenario electoral de Centro ya existente. Se omitió el sembrado.");
            return;
        }

        LocalDateTime ahora = LocalDateTime.now();

        Eleccion eleccion = new Eleccion();
        eleccion.setCentroVecinal(centroVecinal);
        eleccion.setFechaInicioPostulacion(ahora.minusMonths(2));
        eleccion.setFechaFinPostulacion(ahora.minusMonths(1));
        eleccion.setFechaInicioVotacion(ahora.minusDays(7));
        eleccion.setFechaFinVotacion(ahora.plusMonths(3));
        eleccion.setEstado(EstadoEleccion.VOTACION);
        eleccion = eleccionRepository.save(eleccion);

        List<Ciudadano> postulantes = List.of(
                ciudadanosCentro.get(1),
                ciudadanosCentro.get(2),
                ciudadanosCentro.get(3)
        );

        List<Candidatura> candidaturas = new ArrayList<>();
        for (Ciudadano postulante : postulantes) {
            Candidatura candidatura = new Candidatura();
            candidatura.setEleccion(eleccion);
            candidatura.setCiudadano(postulante);
            candidatura.setEstadoValidacion(EstadoValidacionCandidatura.APROBADO);
            candidaturas.add(candidaturaRepository.save(candidatura));
        }

        List<Ciudadano> votantes = new ArrayList<>(ciudadanosCentro);
        votantes.removeAll(postulantes);

        for (int index = 0; index < votantes.size(); index++) {
            Ciudadano votante = votantes.get(index);
            Candidatura candidaturaSeleccionada = candidaturas.get(index % candidaturas.size());

            Voto voto = new Voto();
            voto.setEleccion(eleccion);
            voto.setCiudadano(votante);
            voto.setCandidatura(candidaturaSeleccionada);
            votoRepository.save(voto);
        }

        System.out.println("🌱 Escenario electoral cargado: 40 ciudadanos en Centro, 3 postulantes y votos repartidos.");
    }
}
