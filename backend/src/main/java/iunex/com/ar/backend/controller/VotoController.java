package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.VotoRequestDTO;
import iunex.com.ar.backend.service.VotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votos")
@CrossOrigin(origins = "*")
public class VotoController {

    @Autowired
    private VotoService votoService;

    @GetMapping("/disponibles")
    public ResponseEntity<?> listarEleccionesParaVotar(Authentication authentication) {
        try {
            return new ResponseEntity<>(votoService.listarEleccionesParaVotar(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/mis-votos")
    public ResponseEntity<?> listarMisVotos(Authentication authentication) {
        try {
            return new ResponseEntity<>(votoService.listarMisVotos(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping
    public ResponseEntity<?> votar(@RequestBody VotoRequestDTO dto, Authentication authentication) {
        try {
            return new ResponseEntity<>(votoService.votar(dto, authentication), HttpStatus.CREATED);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
