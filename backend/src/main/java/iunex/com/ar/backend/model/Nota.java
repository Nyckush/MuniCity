package iunex.com.ar.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notas")
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centro_vecinal_id", referencedColumnName = "id", nullable = false)
    private CentroVecinal centroVecinal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_ciudadano_id", referencedColumnName = "id", nullable = false)
    private Ciudadano autor;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaNota categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoNota estado;

    @Column(name = "motivo_estado", columnDefinition = "TEXT")
    private String motivoEstado;

    @Column(name = "mostrar_ubicacion", nullable = false)
    private boolean mostrarUbicacion;

    @Column(name = "mostrar_whats_app", nullable = false)
    private boolean mostrarWhatsApp;

    @Column(name = "mostrar_facebook", nullable = false)
    private boolean mostrarFacebook;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "nota", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ApoyoNota> apoyos = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CentroVecinal getCentroVecinal() {
        return centroVecinal;
    }

    public void setCentroVecinal(CentroVecinal centroVecinal) {
        this.centroVecinal = centroVecinal;
    }

    public Ciudadano getAutor() {
        return autor;
    }

    public void setAutor(Ciudadano autor) {
        this.autor = autor;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ApoyoNota> getApoyos() {
        return apoyos;
    }

    public void setApoyos(List<ApoyoNota> apoyos) {
        this.apoyos = apoyos;
    }
}
