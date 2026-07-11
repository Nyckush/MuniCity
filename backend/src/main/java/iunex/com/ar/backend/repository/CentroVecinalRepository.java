package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.CentroVecinal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CentroVecinalRepository extends JpaRepository<CentroVecinal, Long> {

    boolean existsByNombre(String nombre);

    boolean existsByBarrioId(Long barrioId);

    boolean existsByPresidenteId(Long presidenteId);

    Optional<CentroVecinal> findByBarrioId(Long barrioId);

    Optional<CentroVecinal> findByPresidenteId(Long presidenteId);
}
