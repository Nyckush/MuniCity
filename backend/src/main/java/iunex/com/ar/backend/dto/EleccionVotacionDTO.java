package iunex.com.ar.backend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EleccionVotacionDTO {

    private Long eleccionId;
    private Long centroVecinalId;
    private String centroVecinalNombre;
    private String barrioNombre;
    private LocalDateTime fechaInicioVotacion;
    private LocalDateTime fechaFinVotacion;
    private String estadoEleccion;
    private boolean yaVoto;
    private Long candidaturaSeleccionadaId;
    private String candidatoSeleccionadoNombre;
    private List<CandidatoVotacionDTO> candidatos = new ArrayList<>();

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

    public String getEstadoEleccion() {
        return estadoEleccion;
    }

    public void setEstadoEleccion(String estadoEleccion) {
        this.estadoEleccion = estadoEleccion;
    }

    public boolean isYaVoto() {
        return yaVoto;
    }

    public void setYaVoto(boolean yaVoto) {
        this.yaVoto = yaVoto;
    }

    public Long getCandidaturaSeleccionadaId() {
        return candidaturaSeleccionadaId;
    }

    public void setCandidaturaSeleccionadaId(Long candidaturaSeleccionadaId) {
        this.candidaturaSeleccionadaId = candidaturaSeleccionadaId;
    }

    public String getCandidatoSeleccionadoNombre() {
        return candidatoSeleccionadoNombre;
    }

    public void setCandidatoSeleccionadoNombre(String candidatoSeleccionadoNombre) {
        this.candidatoSeleccionadoNombre = candidatoSeleccionadoNombre;
    }

    public List<CandidatoVotacionDTO> getCandidatos() {
        return candidatos;
    }

    public void setCandidatos(List<CandidatoVotacionDTO> candidatos) {
        this.candidatos = candidatos;
    }
}
