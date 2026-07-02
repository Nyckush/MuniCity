package iunex.com.ar.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "elecciones")
public class Eleccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centro_vecinal_id", referencedColumnName = "id", nullable = false)
    private CentroVecinal centroVecinal;

    @Column(name = "fecha_inicio_postulacion", nullable = false)
    private LocalDateTime fechaInicioPostulacion;

    @Column(name = "fecha_fin_postulacion", nullable = false)
    private LocalDateTime fechaFinPostulacion;

    @Column(name = "fecha_inicio_votacion", nullable = false)
    private LocalDateTime fechaInicioVotacion;

    @Column(name = "fecha_fin_votacion", nullable = false)
    private LocalDateTime fechaFinVotacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEleccion estado;

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

    public LocalDateTime getFechaInicioPostulacion() {
        return fechaInicioPostulacion;
    }

    public void setFechaInicioPostulacion(LocalDateTime fechaInicioPostulacion) {
        this.fechaInicioPostulacion = fechaInicioPostulacion;
    }

    public LocalDateTime getFechaFinPostulacion() {
        return fechaFinPostulacion;
    }

    public void setFechaFinPostulacion(LocalDateTime fechaFinPostulacion) {
        this.fechaFinPostulacion = fechaFinPostulacion;
    }

    public LocalDateTime getFechaInicioVotacion() {
        return fechaInicioVotacion;
    }

    public void setFechaInicioVotacion(LocalDateTime fechaInicioVotacion) {
        this.fechaInicioVotacion = fechaInicioVotacion;
    }

    public LocalDateTime getFechaFinVotacion() {
        return fechaFinVotacion;
    }

    public void setFechaFinVotacion(LocalDateTime fechaFinVotacion) {
        this.fechaFinVotacion = fechaFinVotacion;
    }

    public EstadoEleccion getEstado() {
        return estado;
    }

    public void setEstado(EstadoEleccion estado) {
        this.estado = estado;
    }
}
