package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.EstadoEleccion;
import iunex.com.ar.backend.model.EstadoValidacionCandidatura;

import java.time.LocalDateTime;

public class EleccionCiudadanaDTO {

    private Long eleccionId;
    private Long centroVecinalId;
    private String centroVecinalNombre;
    private String barrioNombre;
    private LocalDateTime fechaInicioPostulacion;
    private LocalDateTime fechaFinPostulacion;
    private LocalDateTime fechaInicioVotacion;
    private LocalDateTime fechaFinVotacion;
    private EstadoEleccion estadoEleccion;
    private boolean yaPostulado;
    private EstadoValidacionCandidatura estadoPostulacion;

    public Long getEleccionId() {
        return eleccionId;
    }

    public void setEleccionId(Long eleccionId) {
        this.eleccionId = eleccionId;
    }

    public Long getCentroVecinalId() {
        return centroVecinalId;
    }

    public void setCentroVecinalId(Long centroVecinalId) {
        this.centroVecinalId = centroVecinalId;
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

    public LocalDateTime getFechaInicioPostulacion() {
        return fechaInicioPostulacion;
    }

    public void setFechaInicioPostulacion(LocalDateTime fechaInicioPostulacion) {
        this.fechaInicioPostulacion = fechaInicioPostulacion;
    }

    public LocalDateTime getFechaFinPostulacion() {
        return fechaFinPostulacion;
    }

    public void setFechaFinPostulacion(LocalDateTime fechaFinPostulacion) {
        this.fechaFinPostulacion = fechaFinPostulacion;
    }

    public LocalDateTime getFechaInicioVotacion() {
        return fechaInicioVotacion;
    }

    public void setFechaInicioVotacion(LocalDateTime fechaInicioVotacion) {
        this.fechaInicioVotacion = fechaInicioVotacion;
    }

    public LocalDateTime getFechaFinVotacion() {
        return fechaFinVotacion;
    }

    public void setFechaFinVotacion(LocalDateTime fechaFinVotacion) {
        this.fechaFinVotacion = fechaFinVotacion;
    }

    public EstadoEleccion getEstadoEleccion() {
        return estadoEleccion;
    }

    public void setEstadoEleccion(EstadoEleccion estadoEleccion) {
        this.estadoEleccion = estadoEleccion;
    }

    public boolean isYaPostulado() {
        return yaPostulado;
    }

    public void setYaPostulado(boolean yaPostulado) {
        this.yaPostulado = yaPostulado;
    }

    public EstadoValidacionCandidatura getEstadoPostulacion() {
        return estadoPostulacion;
    }

    public void setEstadoPostulacion(EstadoValidacionCandidatura estadoPostulacion) {
        this.estadoPostulacion = estadoPostulacion;
    }
}
