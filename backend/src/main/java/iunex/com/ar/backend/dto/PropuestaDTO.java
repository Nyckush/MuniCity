package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.CategoriaPropuesta;
import iunex.com.ar.backend.model.EstadoPropuesta;

public class PropuestaDTO {

    private Long centroVecinalId;
    private String titulo;
    private String descripcion;
    private CategoriaPropuesta categoria;
    private EstadoPropuesta estado;

    public Long getCentroVecinalId() {
        return centroVecinalId;
    }

    public void setCentroVecinalId(Long centroVecinalId) {
        this.centroVecinalId = centroVecinalId;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public CategoriaPropuesta getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaPropuesta categoria) {
        this.categoria = categoria;
    }

    public EstadoPropuesta getEstado() {
        return estado;
    }

    public void setEstado(EstadoPropuesta estado) {
        this.estado = estado;
    }
}
