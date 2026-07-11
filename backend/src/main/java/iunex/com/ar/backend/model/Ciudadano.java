package iunex.com.ar.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ciudadanos")
public class Ciudadano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false, unique = true)
    private String dni;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    // Relación 1 a 1 con la cuenta de usuario
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    // Relación Muchos a 1 con el Barrio
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barrio_id", referencedColumnName = "id", nullable = false)
    private Barrio barrio;

    @OneToOne(mappedBy = "presidente", fetch = FetchType.LAZY)
    @JsonIgnore
    private CentroVecinal centroVecinalPresidido;

    @OneToMany(mappedBy = "ciudadano", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Apoyo> apoyos = new ArrayList<>();

    @OneToMany(mappedBy = "ciudadano", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ApoyoNota> apoyosNotas = new ArrayList<>();

    @OneToMany(mappedBy = "ciudadano", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Observacion> observaciones = new ArrayList<>();

    @OneToMany(mappedBy = "ciudadano", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Notificacion> notificaciones = new ArrayList<>();

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Barrio getBarrio() {
        return barrio;
    }

    public void setBarrio(Barrio barrio) {
        this.barrio = barrio;
    }

    public CentroVecinal getCentroVecinalPresidido() {
        return centroVecinalPresidido;
    }

    public void setCentroVecinalPresidido(CentroVecinal centroVecinalPresidido) {
        this.centroVecinalPresidido = centroVecinalPresidido;
    }

    public List<Apoyo> getApoyos() {
        return apoyos;
    }

    public void setApoyos(List<Apoyo> apoyos) {
        this.apoyos = apoyos;
    }

    public List<ApoyoNota> getApoyosNotas() {
        return apoyosNotas;
    }

    public void setApoyosNotas(List<ApoyoNota> apoyosNotas) {
        this.apoyosNotas = apoyosNotas;
    }

    public List<Observacion> getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(List<Observacion> observaciones) {
        this.observaciones = observaciones;
    }

    public List<Notificacion> getNotificaciones() {
        return notificaciones;
    }

    public void setNotificaciones(List<Notificacion> notificaciones) {
        this.notificaciones = notificaciones;
    }
}
