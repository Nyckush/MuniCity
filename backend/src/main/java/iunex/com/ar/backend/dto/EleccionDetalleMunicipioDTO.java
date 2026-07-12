package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.EstadoEleccion;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EleccionDetalleMunicipioDTO {

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
    private long totalPostulantes;
    private long totalVotos;
    private String ganadorNombre;
    private Long ganadorCandidaturaId;
    private List<EleccionCandidatoResultadoDTO> candidatos = new ArrayList<>();

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

    public long getTotalPostulantes() {
        return totalPostulantes;
    }

    public void setTotalPostulantes(long totalPostulantes) {
        this.totalPostulantes = totalPostulantes;
    }

    public long getTotalVotos() {
        return totalVotos;
    }

    public void setTotalVotos(long totalVotos) {
        this.totalVotos = totalVotos;
    }

    public String getGanadorNombre() {
        return ganadorNombre;
    }

    public void setGanadorNombre(String ganadorNombre) {
        this.ganadorNombre = ganadorNombre;
    }

    public Long getGanadorCandidaturaId() {
        return ganadorCandidaturaId;
    }

    public void setGanadorCandidaturaId(Long ganadorCandidaturaId) {
        this.ganadorCandidaturaId = ganadorCandidaturaId;
    }

    public List<EleccionCandidatoResultadoDTO> getCandidatos() {
        return candidatos;
    }

    public void setCandidatos(List<EleccionCandidatoResultadoDTO> candidatos) {
        this.candidatos = candidatos;
    }
}
