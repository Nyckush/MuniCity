package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.EstadoNota;

public class ActualizarEstadoNotaDTO {

    private EstadoNota estado;
    private String motivo;

    public EstadoNota getEstado() {
        return estado;
    }

    public void setEstado(EstadoNota estado) {
        this.estado = estado;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
