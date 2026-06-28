package iunex.com.ar.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "propuestas")
public class Propuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centro_vecinal_id", referencedColumnName = "id", nullable = false)
    private CentroVecinal centroVecinal;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaPropuesta categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPropuesta estado;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "propuesta", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Apoyo> apoyos = new ArrayList<>();

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Apoyo> getApoyos() {
        return apoyos;
    }

    public void setApoyos(List<Apoyo> apoyos) {
        this.apoyos = apoyos;
    }
}
