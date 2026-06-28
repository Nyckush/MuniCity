package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Observacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObservacionRepository extends JpaRepository<Observacion, Long> {
}
