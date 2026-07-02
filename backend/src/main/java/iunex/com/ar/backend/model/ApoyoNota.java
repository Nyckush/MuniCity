package iunex.com.ar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ciudadano_nota",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ciudadano_nota", columnNames = {"ciudadano_id", "nota_id"})
        }
)
public class ApoyoNota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ciudadano_id", referencedColumnName = "id", nullable = false)
    private Ciudadano ciudadano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_id", referencedColumnName = "id", nullable = false)
    private Nota nota;

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

    public Nota getNota() {
        return nota;
    }

    public void setNota(Nota nota) {
        this.nota = nota;
    }

    public LocalDateTime getFechaApoyo() {
        return fechaApoyo;
    }

    public void setFechaApoyo(LocalDateTime fechaApoyo) {
        this.fechaApoyo = fechaApoyo;
    }
}
