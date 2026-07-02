package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VotoRepository extends JpaRepository<Voto, Long> {

    boolean existsByEleccionIdAndCiudadanoId(Long eleccionId, Long ciudadanoId);

    Optional<Voto> findByEleccionIdAndCiudadanoId(Long eleccionId, Long ciudadanoId);

    List<Voto> findAllByCiudadanoIdOrderByFechaVotoDesc(Long ciudadanoId);
}
