package iunex.com.ar.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "centros_vecinales")
public class CentroVecinal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barrio_id", referencedColumnName = "id", nullable = false, unique = true)
    private Barrio barrio;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "presidente_ciudadano_id", referencedColumnName = "id", nullable = false, unique = true)
    private Ciudadano presidente;

    @OneToMany(mappedBy = "centroVecinal", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Propuesta> propuestas = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Barrio getBarrio() {
        return barrio;
    }

    public void setBarrio(Barrio barrio) {
        this.barrio = barrio;
    }

    public Ciudadano getPresidente() {
        return presidente;
    }

    public void setPresidente(Ciudadano presidente) {
        this.presidente = presidente;
    }

    public List<Propuesta> getPropuestas() {
        return propuestas;
    }

    public void setPropuestas(List<Propuesta> propuestas) {
        this.propuestas = propuestas;
    }
}
