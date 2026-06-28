package iunex.com.ar.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "barrios")
public class Barrio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "El nombre del barrio es obligatorio.")
    private String nombre;

    @Column(name = "habitantes_estimados")
    private Integer habitantesEstimados;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "barrio", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Ciudadano> ciudadanos = new ArrayList<>();

    @OneToOne(mappedBy = "barrio", fetch = FetchType.LAZY)
    @JsonIgnore
    private CentroVecinal centroVecinal;

    @OneToMany(mappedBy = "barrio", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Observacion> observaciones = new ArrayList<>();

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getHabitantesEstimados() {
        return habitantesEstimados;
    }

    public void setHabitantesEstimados(Integer habitantesEstimados) {
        this.habitantesEstimados = habitantesEstimados;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Ciudadano> getCiudadanos() {
        return ciudadanos;
    }

    public void setCiudadanos(List<Ciudadano> ciudadanos) {
        this.ciudadanos = ciudadanos;
    }

    public CentroVecinal getCentroVecinal() {
        return centroVecinal;
    }

    public void setCentroVecinal(CentroVecinal centroVecinal) {
        this.centroVecinal = centroVecinal;
    }

    public List<Observacion> getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(List<Observacion> observaciones) {
        this.observaciones = observaciones;
    }
}
