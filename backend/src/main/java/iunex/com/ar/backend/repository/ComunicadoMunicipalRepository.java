package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.ComunicadoMunicipal;
import iunex.com.ar.backend.model.EstadoComunicadoMunicipal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComunicadoMunicipalRepository extends JpaRepository<ComunicadoMunicipal, Long> {

    List<ComunicadoMunicipal> findAllByMunicipioIdOrderByCreatedAtDesc(Long municipioId);

    boolean existsByMunicipioIdAndTitulo(Long municipioId, String titulo);

    List<ComunicadoMunicipal> findAllByEstadoOrderByDestacadoDescFechaPublicacionDescCreatedAtDesc(
            EstadoComunicadoMunicipal estado
    );
}
