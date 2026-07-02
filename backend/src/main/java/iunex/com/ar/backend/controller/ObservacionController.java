package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.ObservacionRequestDTO;
import iunex.com.ar.backend.service.ObservacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/observaciones")
@CrossOrigin(origins = "*")
public class ObservacionController {

    @Autowired
    private ObservacionService observacionService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearObservacion(@ModelAttribute ObservacionRequestDTO dto, Authentication authentication) {
        try {
            return new ResponseEntity<>(observacionService.guardarObservacion(dto, authentication), HttpStatus.CREATED);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<?> listarObservaciones(Authentication authentication) {
        try {
            return new ResponseEntity<>(observacionService.listarObservaciones(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/mis-observaciones")
    public ResponseEntity<?> listarMisObservaciones(Authentication authentication) {
        try {
            return new ResponseEntity<>(observacionService.listarMisObservaciones(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/recibidas")
    public ResponseEntity<?> listarObservacionesRecibidas(Authentication authentication) {
        try {
            return new ResponseEntity<>(observacionService.listarObservacionesRecibidas(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{observacionId}")
    public ResponseEntity<?> obtenerObservacion(@PathVariable Long observacionId, Authentication authentication) {
        try {
            return new ResponseEntity<>(observacionService.obtenerObservacion(observacionId, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
