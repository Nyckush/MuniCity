package iunex.com.ar.backend.dto;

public class CandidatoVotacionDTO {

    private Long candidaturaId;
    private Long ciudadanoId;
    private String nombreCompleto;
    private String apellido;
    private String estadoValidacion;

    public Long getCandidaturaId() {
        return candidaturaId;
    }

    public void setCandidaturaId(Long candidaturaId) {
        this.candidaturaId = candidaturaId;
    }

    public Long getCiudadanoId() {
        return ciudadanoId;
    }

    public void setCiudadanoId(Long ciudadanoId) {
        this.ciudadanoId = ciudadanoId;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEstadoValidacion() {
        return estadoValidacion;
    }

    public void setEstadoValidacion(String estadoValidacion) {
        this.estadoValidacion = estadoValidacion;
    }
}
