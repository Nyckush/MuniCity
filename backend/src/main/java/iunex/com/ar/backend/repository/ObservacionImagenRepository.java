package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.ObservacionImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObservacionImagenRepository extends JpaRepository<ObservacionImagen, Long> {
}
