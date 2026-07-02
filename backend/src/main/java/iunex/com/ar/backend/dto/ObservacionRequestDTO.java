package iunex.com.ar.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

public class ObservacionRequestDTO {

    private String titulo;
    private String descripcion;
    private String ubicacionEnlace;
    private List<MultipartFile> imagenes = new ArrayList<>();

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

    public String getUbicacionEnlace() {
        return ubicacionEnlace;
    }

    public void setUbicacionEnlace(String ubicacionEnlace) {
        this.ubicacionEnlace = ubicacionEnlace;
    }

    public List<MultipartFile> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<MultipartFile> imagenes) {
        this.imagenes = imagenes;
    }
}
