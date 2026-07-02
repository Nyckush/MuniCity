package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {

    boolean existsByCentroVecinalIdAndTitulo(Long centroVecinalId, String titulo);

    List<Nota> findAllByOrderByCreatedAtDesc();

    List<Nota> findAllByAutorIdOrderByCreatedAtDesc(Long autorId);
}
