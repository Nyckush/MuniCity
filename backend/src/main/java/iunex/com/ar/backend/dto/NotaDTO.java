package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.CategoriaNota;
import iunex.com.ar.backend.model.EstadoNota;

import java.time.LocalDateTime;

public class NotaDTO {

    private Long id;
    private Long barrioId;
    private Long centroVecinalId;
    private String centroVecinalNombre;
    private String barrioNombre;
    private Long autorCiudadanoId;
    private String autorNombre;
    private String titulo;
    private String contenido;
    private CategoriaNota categoria;
    private EstadoNota estado;
    private String motivoEstado;
    private boolean mostrarUbicacion;
    private boolean mostrarWhatsApp;
    private boolean mostrarFacebook;
    private String centroVecinalFotoPerfil;
    private String centroVecinalUbicacion;
    private String centroVecinalWhatsApp;
    private String centroVecinalFacebook;
    private Long cantidadApoyos;
    private boolean apoyadaPorMi;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBarrioId() {
        return barrioId;
    }

    public void setBarrioId(Long barrioId) {
        this.barrioId = barrioId;
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

    public Long getAutorCiudadanoId() {
        return autorCiudadanoId;
    }

    public void setAutorCiudadanoId(Long autorCiudadanoId) {
        this.autorCiudadanoId = autorCiudadanoId;
    }

    public String getAutorNombre() {
        return autorNombre;
    }

    public void setAutorNombre(String autorNombre) {
        this.autorNombre = autorNombre;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public CategoriaNota getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaNota categoria) {
        this.categoria = categoria;
    }

    public EstadoNota getEstado() {
        return estado;
    }

    public void setEstado(EstadoNota estado) {
        this.estado = estado;
    }

    public String getMotivoEstado() {
        return motivoEstado;
    }

    public void setMotivoEstado(String motivoEstado) {
        this.motivoEstado = motivoEstado;
    }

    public boolean isMostrarUbicacion() {
        return mostrarUbicacion;
    }

    public void setMostrarUbicacion(boolean mostrarUbicacion) {
        this.mostrarUbicacion = mostrarUbicacion;
    }

    public boolean isMostrarWhatsApp() {
        return mostrarWhatsApp;
    }

    public void setMostrarWhatsApp(boolean mostrarWhatsApp) {
        this.mostrarWhatsApp = mostrarWhatsApp;
    }

    public boolean isMostrarFacebook() {
        return mostrarFacebook;
    }

    public void setMostrarFacebook(boolean mostrarFacebook) {
        this.mostrarFacebook = mostrarFacebook;
    }

    public String getCentroVecinalFotoPerfil() {
        return centroVecinalFotoPerfil;
    }

    public void setCentroVecinalFotoPerfil(String centroVecinalFotoPerfil) {
        this.centroVecinalFotoPerfil = centroVecinalFotoPerfil;
    }

    public String getCentroVecinalUbicacion() {
        return centroVecinalUbicacion;
    }

    public void setCentroVecinalUbicacion(String centroVecinalUbicacion) {
        this.centroVecinalUbicacion = centroVecinalUbicacion;
    }

    public String getCentroVecinalWhatsApp() {
        return centroVecinalWhatsApp;
    }

    public void setCentroVecinalWhatsApp(String centroVecinalWhatsApp) {
        this.centroVecinalWhatsApp = centroVecinalWhatsApp;
    }

    public String getCentroVecinalFacebook() {
        return centroVecinalFacebook;
    }

    public void setCentroVecinalFacebook(String centroVecinalFacebook) {
        this.centroVecinalFacebook = centroVecinalFacebook;
    }

    public Long getCantidadApoyos() {
        return cantidadApoyos;
    }

    public void setCantidadApoyos(Long cantidadApoyos) {
        this.cantidadApoyos = cantidadApoyos;
    }

    public boolean isApoyadaPorMi() {
        return apoyadaPorMi;
    }

    public void setApoyadaPorMi(boolean apoyadaPorMi) {
        this.apoyadaPorMi = apoyadaPorMi;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
