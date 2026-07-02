package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Observacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservacionRepository extends JpaRepository<Observacion, Long> {

    List<Observacion> findAllByCiudadanoIdOrderByCreatedAtDesc(Long ciudadanoId);

    List<Observacion> findAllByBarrioIdOrderByCreatedAtDesc(Long barrioId);
}
