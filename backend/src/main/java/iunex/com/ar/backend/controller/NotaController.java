package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.NotaRequestDTO;
import iunex.com.ar.backend.dto.ActualizarEstadoNotaDTO;
import iunex.com.ar.backend.service.NotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notas")
@CrossOrigin(origins = "*")
public class NotaController {

    @Autowired
    private NotaService notaService;

    @PostMapping
    public ResponseEntity<?> crearNota(@RequestBody NotaRequestDTO dto, Authentication authentication) {
        try {
            return new ResponseEntity<>(notaService.crearNota(dto, authentication), HttpStatus.CREATED);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<?> listarNotas(Authentication authentication) {
        try {
            return new ResponseEntity<>(notaService.listarNotas(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{notaId}")
    public ResponseEntity<?> obtenerNota(@PathVariable Long notaId, Authentication authentication) {
        try {
            return new ResponseEntity<>(notaService.obtenerNota(notaId, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{notaId}/apoyos")
    public ResponseEntity<?> apoyarNota(@PathVariable Long notaId, Authentication authentication) {
        try {
            return new ResponseEntity<>(notaService.apoyarNota(notaId, authentication), HttpStatus.CREATED);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/mis-notas")
    public ResponseEntity<?> listarMisNotas(Authentication authentication) {
        try {
            return new ResponseEntity<>(notaService.listarMisNotas(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{notaId}/estado")
    public ResponseEntity<?> actualizarEstadoNota(
            @PathVariable Long notaId,
            @RequestBody ActualizarEstadoNotaDTO dto,
            Authentication authentication
    ) {
        try {
            return new ResponseEntity<>(notaService.actualizarEstadoNota(notaId, dto, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
