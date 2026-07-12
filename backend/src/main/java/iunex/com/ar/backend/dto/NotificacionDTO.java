package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.TipoNotificacion;

import java.time.LocalDateTime;

public class NotificacionDTO {

    private Long id;
    private Long ciudadanoId;
    private Long municipioId;
    private Long notaId;
    private Long observacionId;
    private Long comunicadoMunicipalId;
    private TipoNotificacion tipo;
    private String titulo;
    private String mensaje;
    private boolean leida;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCiudadanoId() {
        return ciudadanoId;
    }

    public void setCiudadanoId(Long ciudadanoId) {
        this.ciudadanoId = ciudadanoId;
    }

    public Long getMunicipioId() {
        return municipioId;
    }

    public void setMunicipioId(Long municipioId) {
        this.municipioId = municipioId;
    }

    public Long getNotaId() {
        return notaId;
    }

    public void setNotaId(Long notaId) {
        this.notaId = notaId;
    }

    public Long getObservacionId() {
        return observacionId;
    }

    public void setObservacionId(Long observacionId) {
        this.observacionId = observacionId;
    }

    public Long getComunicadoMunicipalId() {
        return comunicadoMunicipalId;
    }

    public void setComunicadoMunicipalId(Long comunicadoMunicipalId) {
        this.comunicadoMunicipalId = comunicadoMunicipalId;
    }

    public TipoNotificacion getTipo() {
        return tipo;
    }

    public void setTipo(TipoNotificacion tipo) {
        this.tipo = tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public boolean isLeida() {
        return leida;
    }

    public void setLeida(boolean leida) {
        this.leida = leida;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
