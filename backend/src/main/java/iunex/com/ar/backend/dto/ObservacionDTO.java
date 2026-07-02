package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.EstadoObservacion;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ObservacionDTO {

    private Long id;
    private Long ciudadanoId;
    private String ciudadanoNombre;
    private Long barrioId;
    private String barrioNombre;
    private Long centroVecinalId;
    private String centroVecinalNombre;
    private String titulo;
    private String descripcion;
    private EstadoObservacion estado;
    private String ubicacionEnlace;
    private List<String> imagenes = new ArrayList<>();
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

    public String getCiudadanoNombre() {
        return ciudadanoNombre;
    }

    public void setCiudadanoNombre(String ciudadanoNombre) {
        this.ciudadanoNombre = ciudadanoNombre;
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

    public EstadoObservacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoObservacion estado) {
        this.estado = estado;
    }

    public String getUbicacionEnlace() {
        return ubicacionEnlace;
    }

    public void setUbicacionEnlace(String ubicacionEnlace) {
        this.ubicacionEnlace = ubicacionEnlace;
    }

    public List<String> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<String> imagenes) {
        this.imagenes = imagenes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
