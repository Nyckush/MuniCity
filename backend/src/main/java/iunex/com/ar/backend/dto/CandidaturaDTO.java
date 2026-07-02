package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.EstadoEleccion;
import iunex.com.ar.backend.model.EstadoValidacionCandidatura;

import java.time.LocalDateTime;

public class CandidaturaDTO {

    private Long candidaturaId;
    private Long eleccionId;
    private String centroVecinalNombre;
    private String barrioNombre;
    private EstadoEleccion estadoEleccion;
    private EstadoValidacionCandidatura estadoValidacion;
    private LocalDateTime fechaPostulacion;

    public Long getCandidaturaId() {
        return candidaturaId;
    }

    public void setCandidaturaId(Long candidaturaId) {
        this.candidaturaId = candidaturaId;
    }

    public Long getEleccionId() {
        return eleccionId;
    }

    public void setEleccionId(Long eleccionId) {
        this.eleccionId = eleccionId;
    }

    public String getCentroVecinalNombre() {
        return centroVecinalNombre;
    }

    public void setCentroVecinalNombre(String centroVecinalNombre) {
        this.centroVecinalNombre = centroVecinalNombre;
    }

    public String getBarrioNombre() {
        return barrioNombre;
    }

    public void setBarrioNombre(String barrioNombre) {
        this.barrioNombre = barrioNombre;
    }

    public EstadoEleccion getEstadoEleccion() {
        return estadoEleccion;
    }

    public void setEstadoEleccion(EstadoEleccion estadoEleccion) {
        this.estadoEleccion = estadoEleccion;
    }

    public EstadoValidacionCandidatura getEstadoValidacion() {
        return estadoValidacion;
    }

    public void setEstadoValidacion(EstadoValidacionCandidatura estadoValidacion) {
        this.estadoValidacion = estadoValidacion;
    }

    public LocalDateTime getFechaPostulacion() {
        return fechaPostulacion;
    }

    public void setFechaPostulacion(LocalDateTime fechaPostulacion) {
        this.fechaPostulacion = fechaPostulacion;
    }
}
