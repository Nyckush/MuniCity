package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.EstadoEleccion;

import java.time.LocalDateTime;

public class EleccionDTO {

    private Long id;
    private Long centroVecinalId;
    private String centroVecinalNombre;
    private Long barrioId;
    private String barrioNombre;
    private LocalDateTime fechaInicioPostulacion;
    private LocalDateTime fechaFinPostulacion;
    private LocalDateTime fechaInicioVotacion;
    private LocalDateTime fechaFinVotacion;
    private EstadoEleccion estado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getBarrioId() {
        return barrioId;
    }

    public void setBarrioId(Long barrioId) {
        this.barrioId = barrioId;
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

    public EstadoEleccion getEstado() {
        return estado;
    }

    public void setEstado(EstadoEleccion estado) {
        this.estado = estado;
    }
}
