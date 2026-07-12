package iunex.com.ar.backend.service;

import iunex.com.ar.backend.dto.NotificacionDTO;
import iunex.com.ar.backend.dto.NotificacionResumenDTO;
import iunex.com.ar.backend.model.ApoyoNota;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.model.Ciudadano;
import iunex.com.ar.backend.model.ComunicadoMunicipal;
import iunex.com.ar.backend.model.EstadoNota;
import iunex.com.ar.backend.model.Municipio;
import iunex.com.ar.backend.model.Nota;
import iunex.com.ar.backend.model.Notificacion;
import iunex.com.ar.backend.model.Observacion;
import iunex.com.ar.backend.model.TipoNotificacion;
import iunex.com.ar.backend.model.User;
import iunex.com.ar.backend.repository.ApoyoNotaRepository;
import iunex.com.ar.backend.repository.CiudadanoRepository;
import iunex.com.ar.backend.repository.MunicipioRepository;
import iunex.com.ar.backend.repository.NotificacionRepository;
import iunex.com.ar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificacionService {

    private static final String TITULO_NOTA_NUEVA = "Nueva nota de tu representante";
    private static final String TITULO_NOTA_APROBADA = "Nota aprobada por el municipio";
    private static final String TITULO_NOTA_RECHAZADA = "Nota rechazada por el municipio";
    private static final String TITULO_OBSERVACION_NUEVA = "Nueva observación recibida";
    private static final String TITULO_NOTA_NUEVA_MUNICIPIO = "Nueva nota enviada por un presidente";
    private static final String TITULO_COMUNICADO_NUEVO = "Nuevo comunicado municipal";

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private MunicipioRepository municipioRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApoyoNotaRepository apoyoNotaRepository;

    @Transactional
    public List<Notificacion> crearNotificacionesPorNuevaNota(Nota nota) {
        if (nota == null || nota.getId() == null) {
            throw new RuntimeException("La nota es obligatoria para generar notificaciones.");
        }

        CentroVecinal centroVecinal = nota.getCentroVecinal();
        if (centroVecinal == null || centroVecinal.getBarrio() == null) {
            throw new RuntimeException("La nota no tiene un barrio asociado para notificar.");
        }

        Long barrioId = centroVecinal.getBarrio().getId();
        Long autorId = nota.getAutor() != null ? nota.getAutor().getId() : null;

        if (barrioId == null || autorId == null) {
            throw new RuntimeException("La nota no tiene datos suficientes para generar notificaciones.");
        }

        List<Ciudadano> destinatarios = ciudadanoRepository.findAllByBarrioIdAndIdNotOrderByIdAsc(barrioId, autorId);
        List<Notificacion> notificaciones = new ArrayList<>();

        for (Ciudadano destinatario : destinatarios) {
            Notificacion notificacion = crearNotificacionSiNoExiste(destinatario, nota);
            if (notificacion != null) {
                notificaciones.add(notificacion);
            }
        }

        Notificacion notificacionMunicipal = crearNotificacionMunicipalSiNoExiste(nota);
        if (notificacionMunicipal != null) {
            notificaciones.add(notificacionMunicipal);
        }

        return notificaciones;
    }

    @Transactional
    public List<Notificacion> crearNotificacionesPorEstadoFinalDeNota(Nota nota, EstadoNota estadoAnterior) {
        if (nota == null || nota.getId() == null) {
            throw new RuntimeException("La nota es obligatoria para generar notificaciones finales.");
        }

        EstadoNota estadoActual = nota.getEstado();
        if (estadoActual != EstadoNota.APROBADA && estadoActual != EstadoNota.RECHAZADA) {
            return List.of();
        }

        if (estadoActual == estadoAnterior) {
            return List.of();
        }

        TipoNotificacion tipo = estadoActual == EstadoNota.APROBADA
                ? TipoNotificacion.NOTA_APROBADA
                : TipoNotificacion.NOTA_RECHAZADA;

        Map<Long, Ciudadano> destinatarios = new LinkedHashMap<>();
        if (nota.getAutor() != null && nota.getAutor().getId() != null) {
            destinatarios.put(nota.getAutor().getId(), nota.getAutor());
        }

        for (ApoyoNota apoyoNota : apoyoNotaRepository.findAllByNotaId(nota.getId())) {
            Ciudadano ciudadano = apoyoNota.getCiudadano();
            if (ciudadano != null && ciudadano.getId() != null) {
                destinatarios.putIfAbsent(ciudadano.getId(), ciudadano);
            }
        }

        List<Notificacion> notificaciones = new ArrayList<>();
        for (Ciudadano destinatario : destinatarios.values()) {
            Notificacion notificacion = crearNotificacionFinalSiNoExiste(destinatario, nota, tipo);
            if (notificacion != null) {
                notificaciones.add(notificacion);
            }
        }

        return notificaciones;
    }

    @Transactional
    public Notificacion crearNotificacionPorNuevaObservacion(Observacion observacion) {
        if (observacion == null || observacion.getId() == null) {
            throw new RuntimeException("La observación es obligatoria para generar notificaciones.");
        }

        if (observacion.getBarrio() == null || observacion.getBarrio().getCentroVecinal() == null) {
            return null;
        }

        Ciudadano presidente = observacion.getBarrio().getCentroVecinal().getPresidente();
        Ciudadano autor = observacion.getCiudadano();

        if (presidente == null || presidente.getId() == null) {
            return null;
        }

        if (autor != null && presidente.getId().equals(autor.getId())) {
            return null;
        }

        if (notificacionRepository.existsByCiudadanoIdAndObservacionIdAndTipo(
                presidente.getId(),
                observacion.getId(),
                TipoNotificacion.OBSERVACION_NUEVA
        )) {
            return null;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setCiudadano(presidente);
        notificacion.setObservacion(observacion);
        notificacion.setTipo(TipoNotificacion.OBSERVACION_NUEVA);
        notificacion.setTitulo(TITULO_OBSERVACION_NUEVA);
        notificacion.setMensaje(construirMensajeNuevaObservacion(observacion));
        notificacion.setLeida(false);

        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public List<Notificacion> crearNotificacionesPorNuevoComunicado(ComunicadoMunicipal comunicadoMunicipal) {
        if (comunicadoMunicipal == null || comunicadoMunicipal.getId() == null) {
            throw new RuntimeException("El comunicado es obligatorio para generar notificaciones.");
        }

        List<Ciudadano> destinatarios = comunicadoMunicipal.isEsGlobal()
                ? ciudadanoRepository.findAll()
                : comunicadoMunicipal.getBarrio() != null
                ? ciudadanoRepository.findAllByBarrioIdOrderByIdAsc(comunicadoMunicipal.getBarrio().getId())
                : List.of();

        List<Notificacion> notificaciones = new ArrayList<>();
        for (Ciudadano destinatario : destinatarios) {
            if (destinatario == null || destinatario.getId() == null) {
                continue;
            }

            Notificacion notificacion = crearNotificacionComunicadoSiNoExiste(destinatario, comunicadoMunicipal);
            if (notificacion != null) {
                notificaciones.add(notificacion);
            }
        }

        return notificaciones;
    }

    @Transactional(readOnly = true)
    public List<NotificacionDTO> listarMisNotificaciones(org.springframework.security.core.Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            Municipio municipio = getMunicipioAutenticado(authentication);

            return notificacionRepository.findAllByMunicipioIdOrderByCreatedAtDesc(municipio.getId())
                    .stream()
                    .map(this::toDto)
                    .toList();
        }

        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);

        return notificacionRepository.findAllByCiudadanoIdOrderByCreatedAtDesc(ciudadano.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotificacionResumenDTO obtenerResumen(org.springframework.security.core.Authentication authentication) {
        NotificacionResumenDTO dto = new NotificacionResumenDTO();

        User user = getAuthenticatedUser(authentication);
        if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            Municipio municipio = getMunicipioAutenticado(authentication);
            dto.setTotalNoLeidas(notificacionRepository.countByMunicipioIdAndLeidaFalse(municipio.getId()));
            return dto;
        }

        Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
        dto.setTotalNoLeidas(notificacionRepository.countByCiudadanoIdAndLeidaFalse(ciudadano.getId()));
        return dto;
    }

    @Transactional
    public NotificacionDTO marcarComoLeida(Long notificacionId, org.springframework.security.core.Authentication authentication) {
        if (notificacionId == null) {
            throw new RuntimeException("La notificación es obligatoria.");
        }

        User user = getAuthenticatedUser(authentication);
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("La notificación seleccionada no existe."));

        if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            Municipio municipio = getMunicipioAutenticado(authentication);
            if (notificacion.getMunicipio() == null || !notificacion.getMunicipio().getId().equals(municipio.getId())) {
                throw new RuntimeException("No tenés permisos para modificar esta notificación.");
            }
        } else {
            Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
            if (notificacion.getCiudadano() == null || !notificacion.getCiudadano().getId().equals(ciudadano.getId())) {
                throw new RuntimeException("No tenés permisos para modificar esta notificación.");
            }
        }

        if (!notificacion.isLeida()) {
            notificacion.setLeida(true);
            notificacion = notificacionRepository.save(notificacion);
        }

        return toDto(notificacion);
    }

    @Transactional
    public NotificacionResumenDTO marcarTodasComoLeidas(org.springframework.security.core.Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Notificacion> pendientes;

        if ("ROLE_MUNICIPIO".equals(user.getRole())) {
            Municipio municipio = getMunicipioAutenticado(authentication);
            pendientes = notificacionRepository.findAllByMunicipioIdAndLeidaFalseOrderByCreatedAtDesc(municipio.getId());
        } else {
            Ciudadano ciudadano = getCiudadanoAutenticado(authentication);
            pendientes = notificacionRepository.findAllByCiudadanoIdAndLeidaFalseOrderByCreatedAtDesc(ciudadano.getId());
        }

        for (Notificacion notificacion : pendientes) {
            notificacion.setLeida(true);
        }

        if (!pendientes.isEmpty()) {
            notificacionRepository.saveAll(pendientes);
        }

        NotificacionResumenDTO dto = new NotificacionResumenDTO();
        dto.setTotalNoLeidas(0);
        return dto;
    }

    private Notificacion crearNotificacionSiNoExiste(Ciudadano destinatario, Nota nota) {
        if (notificacionRepository.existsByCiudadanoIdAndNotaIdAndTipo(
                destinatario.getId(),
                nota.getId(),
                TipoNotificacion.NOTA_NUEVA
        )) {
            return null;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setCiudadano(destinatario);
        notificacion.setNota(nota);
        notificacion.setTipo(TipoNotificacion.NOTA_NUEVA);
        notificacion.setTitulo(TITULO_NOTA_NUEVA);
        notificacion.setMensaje(construirMensajeNuevaNota(nota));
        notificacion.setLeida(false);

        return notificacionRepository.save(notificacion);
    }

    private Notificacion crearNotificacionMunicipalSiNoExiste(Nota nota) {
        if (nota.getAutor() == null || nota.getAutor().getUser() == null) {
            return null;
        }

        if (!"ROLE_PRESIDENTE".equals(nota.getAutor().getUser().getRole())) {
            return null;
        }

        List<Municipio> municipios = municipioRepository.findAll();
        if (municipios.isEmpty()) {
            return null;
        }

        Municipio municipio = municipios.get(0);
        if (municipio.getId() == null || notificacionRepository.existsByMunicipioIdAndNotaIdAndTipo(
                municipio.getId(),
                nota.getId(),
                TipoNotificacion.NOTA_NUEVA
        )) {
            return null;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setMunicipio(municipio);
        notificacion.setNota(nota);
        notificacion.setTipo(TipoNotificacion.NOTA_NUEVA);
        notificacion.setTitulo(TITULO_NOTA_NUEVA_MUNICIPIO);
        notificacion.setMensaje(construirMensajeNuevaNotaMunicipio(nota));
        notificacion.setLeida(false);

        return notificacionRepository.save(notificacion);
    }

    private Notificacion crearNotificacionFinalSiNoExiste(Ciudadano destinatario, Nota nota, TipoNotificacion tipo) {
        if (notificacionRepository.existsByCiudadanoIdAndNotaIdAndTipo(destinatario.getId(), nota.getId(), tipo)) {
            return null;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setCiudadano(destinatario);
        notificacion.setNota(nota);
        notificacion.setTipo(tipo);
        notificacion.setTitulo(tipo == TipoNotificacion.NOTA_APROBADA ? TITULO_NOTA_APROBADA : TITULO_NOTA_RECHAZADA);
        notificacion.setMensaje(construirMensajeEstadoFinal(nota, destinatario, tipo));
        notificacion.setLeida(false);
        return notificacionRepository.save(notificacion);
    }

    private Notificacion crearNotificacionComunicadoSiNoExiste(Ciudadano destinatario, ComunicadoMunicipal comunicadoMunicipal) {
        if (notificacionRepository.existsByCiudadanoIdAndComunicadoMunicipalIdAndTipo(
                destinatario.getId(),
                comunicadoMunicipal.getId(),
                TipoNotificacion.COMUNICADO_NUEVO
        )) {
            return null;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setCiudadano(destinatario);
        notificacion.setComunicadoMunicipal(comunicadoMunicipal);
        notificacion.setTipo(TipoNotificacion.COMUNICADO_NUEVO);
        notificacion.setTitulo(TITULO_COMUNICADO_NUEVO);
        notificacion.setMensaje(construirMensajeNuevoComunicado(comunicadoMunicipal));
        notificacion.setLeida(false);
        return notificacionRepository.save(notificacion);
    }

    private String construirMensajeNuevaNota(Nota nota) {
        String barrioNombre = nota.getCentroVecinal().getBarrio().getNombre();
        String autorNombre = nota.getAutor().getNombreCompleto();

        return "Tu representante " + autorNombre
                + " publico una nueva nota para el barrio "
                + barrioNombre
                + " y necesita tu apoyo.";
    }

    private String construirMensajeEstadoFinal(Nota nota, Ciudadano destinatario, TipoNotificacion tipo) {
        boolean esAutor = nota.getAutor() != null
                && nota.getAutor().getId() != null
                && nota.getAutor().getId().equals(destinatario.getId());

        String estadoTexto = tipo == TipoNotificacion.NOTA_APROBADA ? "aprobó" : "rechazó";
        String mensajeBase = esAutor
                ? "El municipio " + estadoTexto + " tu nota \"" + nota.getTitulo() + "\"."
                : "El municipio " + estadoTexto + " una nota que apoyaste: \"" + nota.getTitulo() + "\".";

        if (nota.getMotivoEstado() != null && !nota.getMotivoEstado().isBlank()) {
            return mensajeBase + " Motivo: " + nota.getMotivoEstado().trim();
        }

        return mensajeBase;
    }

    private String construirMensajeNuevaObservacion(Observacion observacion) {
        String ciudadanoNombre = observacion.getCiudadano().getNombreCompleto();
        String barrioNombre = observacion.getBarrio().getNombre();

        return ciudadanoNombre
                + " envió una nueva observación para el barrio "
                + barrioNombre
                + ": \"" + observacion.getTitulo() + "\".";
    }

    private String construirMensajeNuevaNotaMunicipio(Nota nota) {
        String autorNombre = nota.getAutor().getNombreCompleto();
        String barrioNombre = nota.getCentroVecinal().getBarrio().getNombre();
        String centroVecinalNombre = nota.getCentroVecinal().getNombre();

        return autorNombre
                + " publicó una nueva nota como presidente de "
                + centroVecinalNombre
                + " para el barrio "
                + barrioNombre
                + ": \"" + nota.getTitulo() + "\".";
    }

    private String construirMensajeNuevoComunicado(ComunicadoMunicipal comunicadoMunicipal) {
        String alcance = comunicadoMunicipal.isEsGlobal()
                ? "para todos los barrios"
                : "para el barrio " + comunicadoMunicipal.getBarrio().getNombre();

        return comunicadoMunicipal.getMunicipio().getNombre()
                + " publicó un nuevo comunicado "
                + alcance
                + ": \"" + comunicadoMunicipal.getTitulo() + "\".";
    }

    private User getAuthenticatedUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No hay una sesión autenticada.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));
    }

    private Ciudadano getCiudadanoAutenticado(org.springframework.security.core.Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        if (!"ROLE_CIUDADANO".equals(user.getRole()) && !"ROLE_PRESIDENTE".equals(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para ciudadanos.");
        }

        return ciudadanoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil ciudadano asociado."));
    }

    private Municipio getMunicipioAutenticado(org.springframework.security.core.Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        if (!"ROLE_MUNICIPIO".equals(user.getRole())) {
            throw new RuntimeException("Esta acción solo está disponible para municipio.");
        }

        return municipioRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil de municipio asociado."));
    }

    private NotificacionDTO toDto(Notificacion notificacion) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setId(notificacion.getId());
        dto.setCiudadanoId(notificacion.getCiudadano() != null ? notificacion.getCiudadano().getId() : null);
        dto.setMunicipioId(notificacion.getMunicipio() != null ? notificacion.getMunicipio().getId() : null);
        dto.setNotaId(notificacion.getNota() != null ? notificacion.getNota().getId() : null);
        dto.setObservacionId(notificacion.getObservacion() != null ? notificacion.getObservacion().getId() : null);
        dto.setComunicadoMunicipalId(notificacion.getComunicadoMunicipal() != null ? notificacion.getComunicadoMunicipal().getId() : null);
        dto.setTipo(notificacion.getTipo());
        dto.setTitulo(notificacion.getTitulo());
        dto.setMensaje(notificacion.getMensaje());
        dto.setLeida(notificacion.isLeida());
        dto.setCreatedAt(notificacion.getCreatedAt());
        return dto;
    }
}
