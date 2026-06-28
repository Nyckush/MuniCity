package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Ciudadano;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CiudadanoRepository extends JpaRepository<Ciudadano, Long> {

    // Para buscar un ciudadano por su documento
    Optional<Ciudadano> findByDni(String dni);

    Optional<Ciudadano> findByUserId(Long userId);

    // Para verificar rápidamente si el DNI ya está en uso
    boolean existsByDni(String dni);
}
