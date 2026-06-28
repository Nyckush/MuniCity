package iunex.com.ar.backend.dto;

public class CentroVecinalDTO {

    private String nombre;
    private Long barrioId;
    private Long presidenteCiudadanoId;

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

    public Long getPresidenteCiudadanoId() {
        return presidenteCiudadanoId;
    }

    public void setPresidenteCiudadanoId(Long presidenteCiudadanoId) {
        this.presidenteCiudadanoId = presidenteCiudadanoId;
    }
}
