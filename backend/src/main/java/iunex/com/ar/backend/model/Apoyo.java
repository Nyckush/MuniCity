package iunex.com.ar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ciudadano_propuesta",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ciudadano_propuesta", columnNames = {"ciudadano_id", "propuesta_id"})
        }
)
public class Apoyo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ciudadano_id", referencedColumnName = "id", nullable = false)
    private Ciudadano ciudadano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propuesta_id", referencedColumnName = "id", nullable = false)
    private Propuesta propuesta;

    @CreationTimestamp
    @Column(name = "fecha_apoyo", nullable = false, updatable = false)
    private LocalDateTime fechaApoyo;

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

    public Propuesta getPropuesta() {
        return propuesta;
    }

    public void setPropuesta(Propuesta propuesta) {
        this.propuesta = propuesta;
    }

    public LocalDateTime getFechaApoyo() {
        return fechaApoyo;
    }

    public void setFechaApoyo(LocalDateTime fechaApoyo) {
        this.fechaApoyo = fechaApoyo;
    }
}
