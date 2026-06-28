package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Apoyo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApoyoRepository extends JpaRepository<Apoyo, Long> {

    boolean existsByCiudadanoIdAndPropuestaId(Long ciudadanoId, Long propuestaId);
}
