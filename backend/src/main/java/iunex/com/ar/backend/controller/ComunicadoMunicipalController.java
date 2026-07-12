package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.ComunicadoMunicipalRequestDTO;
import iunex.com.ar.backend.service.ComunicadoMunicipalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comunicados")
@CrossOrigin(origins = "*")
public class ComunicadoMunicipalController {

    @Autowired
    private ComunicadoMunicipalService comunicadoMunicipalService;

    @PostMapping
    public ResponseEntity<?> crearComunicado(@RequestBody ComunicadoMunicipalRequestDTO dto, Authentication authentication) {
        try {
            return new ResponseEntity<>(comunicadoMunicipalService.crearComunicado(dto, authentication), HttpStatus.CREATED);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{comunicadoId}")
    public ResponseEntity<?> actualizarComunicado(
            @PathVariable Long comunicadoId,
            @RequestBody ComunicadoMunicipalRequestDTO dto,
            Authentication authentication
    ) {
        try {
            return new ResponseEntity<>(comunicadoMunicipalService.actualizarComunicado(comunicadoId, dto, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/{comunicadoId}/publicar")
    public ResponseEntity<?> publicarComunicado(@PathVariable Long comunicadoId, Authentication authentication) {
        try {
            return new ResponseEntity<>(comunicadoMunicipalService.publicarComunicado(comunicadoId, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/{comunicadoId}/archivar")
    public ResponseEntity<?> archivarComunicado(@PathVariable Long comunicadoId, Authentication authentication) {
        try {
            return new ResponseEntity<>(comunicadoMunicipalService.archivarComunicado(comunicadoId, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<?> listarComunicadosMunicipio(Authentication authentication) {
        try {
            return new ResponseEntity<>(comunicadoMunicipalService.listarComunicadosMunicipio(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/visibles")
    public ResponseEntity<?> listarComunicadosVisibles(Authentication authentication) {
        try {
            return new ResponseEntity<>(comunicadoMunicipalService.listarComunicadosVisibles(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{comunicadoId}")
    public ResponseEntity<?> obtenerComunicado(@PathVariable Long comunicadoId, Authentication authentication) {
        try {
            return new ResponseEntity<>(comunicadoMunicipalService.obtenerComunicado(comunicadoId, authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
