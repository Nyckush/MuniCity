package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.CentroVecinal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CentroVecinalRepository extends JpaRepository<CentroVecinal, Long> {

    boolean existsByNombre(String nombre);

    boolean existsByBarrioId(Long barrioId);

    boolean existsByPresidenteId(Long presidenteId);
}
