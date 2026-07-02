package iunex.com.ar.backend.dto;

import iunex.com.ar.backend.model.CategoriaNota;

public class NotaRequestDTO {

    private String titulo;
    private String contenido;
    private CategoriaNota categoria;

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
}
