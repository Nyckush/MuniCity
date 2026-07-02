package iunex.com.ar.backend.dto;

import java.time.LocalDateTime;

public class CrearEleccionDTO {

    private Long centroVecinalId;
    private LocalDateTime fechaInicioPostulacion;
    private LocalDateTime fechaFinPostulacion;
    private LocalDateTime fechaInicioVotacion;
    private LocalDateTime fechaFinVotacion;

    public Long getCentroVecinalId() {
        return centroVecinalId;
    }

    public void setCentroVecinalId(Long centroVecinalId) {
        this.centroVecinalId = centroVecinalId;
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
}
