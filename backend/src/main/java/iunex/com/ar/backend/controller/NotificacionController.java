package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<?> listarMisNotificaciones(Authentication authentication) {
        try {
            return new ResponseEntity<>(notificacionService.listarMisNotificaciones(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/resumen")
    public ResponseEntity<?> obtenerResumen(Authentication authentication) {
        try {
            return new ResponseEntity<>(notificacionService.obtenerResumen(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{notificacionId}/leer")
    public ResponseEntity<?> marcarComoLeida(@PathVariable Long notificacionId, Authentication authentication) {
        try {
            return new ResponseEntity<>(notificacionService.marcarComoLeida(notificacionId, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<?> marcarTodasComoLeidas(Authentication authentication) {
        try {
            return new ResponseEntity<>(notificacionService.marcarTodasComoLeidas(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
