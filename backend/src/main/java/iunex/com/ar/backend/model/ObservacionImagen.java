package iunex.com.ar.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "observacion_imagenes")
public class ObservacionImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observacion_id", referencedColumnName = "id", nullable = false)
    private Observacion observacion;

    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Observacion getObservacion() {
        return observacion;
    }

    public void setObservacion(Observacion observacion) {
        this.observacion = observacion;
    }

    public String getRutaArchivo() {
        return rutaArchivo;
    }

    public void setRutaArchivo(String rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }
}
