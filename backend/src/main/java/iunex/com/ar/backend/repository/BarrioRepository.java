package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Barrio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BarrioRepository extends JpaRepository<Barrio, Long> {

    // Para verificar si ya existe un barrio con ese nombre antes de guardarlo
    boolean existsByNombre(String nombre);

    Optional<Barrio> findByNombre(String nombre);
}
