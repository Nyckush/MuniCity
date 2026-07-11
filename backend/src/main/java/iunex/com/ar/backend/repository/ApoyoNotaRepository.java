package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.ApoyoNota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApoyoNotaRepository extends JpaRepository<ApoyoNota, Long> {

    boolean existsByCiudadanoIdAndNotaId(Long ciudadanoId, Long notaId);

    long countByNotaId(Long notaId);

    List<ApoyoNota> findAllByNotaId(Long notaId);
}
