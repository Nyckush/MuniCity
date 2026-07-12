package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Candidatura;
import iunex.com.ar.backend.model.EstadoValidacionCandidatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidaturaRepository extends JpaRepository<Candidatura, Long> {

    boolean existsByEleccionIdAndCiudadanoId(Long eleccionId, Long ciudadanoId);

    Optional<Candidatura> findByEleccionIdAndCiudadanoId(Long eleccionId, Long ciudadanoId);

    List<Candidatura> findAllByCiudadanoIdOrderByFechaPostulacionDesc(Long ciudadanoId);

    List<Candidatura> findAllByEleccionCentroVecinalBarrioIdOrderByFechaPostulacionDesc(Long barrioId);

    List<Candidatura> findAllByEleccionIdAndEstadoValidacionNotOrderByFechaPostulacionAsc(
            Long eleccionId,
            EstadoValidacionCandidatura estadoValidacion
    );

    List<Candidatura> findAllByEleccionIdOrderByFechaPostulacionAsc(Long eleccionId);
}
