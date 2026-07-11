package iunex.com.ar.backend.dto;

public class CentroVecinalDTO {

    private Long id;
    private String nombre;
    private Long barrioId;
    private String barrioNombre;
    private Long presidenteCiudadanoId;
    private String presidenteNombreCompleto;
    private String fotoPerfil;
    private String ubicacion;
    private String whatsApp;
    private String facebook;

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

    public Long getBarrioId() {
        return barrioId;
    }

    public void setBarrioId(Long barrioId) {
        this.barrioId = barrioId;
    }

    public String getBarrioNombre() {
        return barrioNombre;
    }

    public void setBarrioNombre(String barrioNombre) {
        this.barrioNombre = barrioNombre;
    }

    public Long getPresidenteCiudadanoId() {
        return presidenteCiudadanoId;
    }

    public void setPresidenteCiudadanoId(Long presidenteCiudadanoId) {
        this.presidenteCiudadanoId = presidenteCiudadanoId;
    }

    public String getPresidenteNombreCompleto() {
        return presidenteNombreCompleto;
    }

    public void setPresidenteNombreCompleto(String presidenteNombreCompleto) {
        this.presidenteNombreCompleto = presidenteNombreCompleto;
    }

    public String getFotoPerfil() {
        return fotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil) {
        this.fotoPerfil = fotoPerfil;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public String getWhatsApp() {
        return whatsApp;
    }

    public void setWhatsApp(String whatsApp) {
        this.whatsApp = whatsApp;
    }

    public String getFacebook() {
        return facebook;
    }

    public void setFacebook(String facebook) {
        this.facebook = facebook;
    }
}
