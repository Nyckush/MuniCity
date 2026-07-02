package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Municipio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MunicipioRepository extends JpaRepository<Municipio, Long> {

    Optional<Municipio> findByUserId(Long userId);

    boolean existsByNombre(String nombre);
}
