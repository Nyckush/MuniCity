package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Propuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropuestaRepository extends JpaRepository<Propuesta, Long> {
}
