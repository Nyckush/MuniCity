package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Notificacion;
import iunex.com.ar.backend.model.TipoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findAllByCiudadanoIdOrderByCreatedAtDesc(Long ciudadanoId);

    List<Notificacion> findAllByMunicipioIdOrderByCreatedAtDesc(Long municipioId);

    long countByCiudadanoIdAndLeidaFalse(Long ciudadanoId);

    long countByMunicipioIdAndLeidaFalse(Long municipioId);

    boolean existsByCiudadanoIdAndNotaIdAndTipo(Long ciudadanoId, Long notaId, TipoNotificacion tipo);

    boolean existsByMunicipioIdAndNotaIdAndTipo(Long municipioId, Long notaId, TipoNotificacion tipo);

    List<Notificacion> findAllByCiudadanoIdAndLeidaFalseOrderByCreatedAtDesc(Long ciudadanoId);

    List<Notificacion> findAllByMunicipioIdAndLeidaFalseOrderByCreatedAtDesc(Long municipioId);

    boolean existsByCiudadanoIdAndObservacionIdAndTipo(Long ciudadanoId, Long observacionId, TipoNotificacion tipo);

    boolean existsByCiudadanoIdAndComunicadoMunicipalIdAndTipo(Long ciudadanoId, Long comunicadoMunicipalId, TipoNotificacion tipo);
}
