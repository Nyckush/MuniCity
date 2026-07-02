package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.Eleccion;
import iunex.com.ar.backend.model.EstadoEleccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface EleccionRepository extends JpaRepository<Eleccion, Long> {

    boolean existsByCentroVecinalIdAndEstadoIn(Long centroVecinalId, Collection<EstadoEleccion> estados);

    boolean existsByCentroVecinalIdAndEstadoInAndIdNot(Long centroVecinalId, Collection<EstadoEleccion> estados, Long id);

    List<Eleccion> findAllByOrderByFechaInicioPostulacionDesc();

    List<Eleccion> findByCentroVecinalBarrioIdOrderByFechaInicioPostulacionDesc(Long barrioId);
}
