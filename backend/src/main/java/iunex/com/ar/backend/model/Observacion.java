package iunex.com.ar.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "observaciones")
public class Observacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ciudadano_id", referencedColumnName = "id", nullable = false)
    private Ciudadano ciudadano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barrio_id", referencedColumnName = "id", nullable = false)
    private Barrio barrio;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoObservacion estado;

    @Column(name = "ubicacion_enlace", length = 1000)
    private String ubicacionEnlace;

    @OneToMany(mappedBy = "observacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ObservacionImagen> imagenes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void addImagen(ObservacionImagen imagen) {
        imagenes.add(imagen);
        imagen.setObservacion(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Ciudadano getCiudadano() {
        return ciudadano;
    }

    public void setCiudadano(Ciudadano ciudadano) {
        this.ciudadano = ciudadano;
    }

    public Barrio getBarrio() {
        return barrio;
    }

    public void setBarrio(Barrio barrio) {
        this.barrio = barrio;
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

    public List<ObservacionImagen> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<ObservacionImagen> imagenes) {
        this.imagenes = imagenes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
