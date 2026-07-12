package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.PostulacionRequestDTO;
import iunex.com.ar.backend.service.CandidaturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidaturas")
@CrossOrigin(origins = "*")
public class CandidaturaController {

    @Autowired
    private CandidaturaService candidaturaService;

    @GetMapping("/disponibles")
    public ResponseEntity<?> listarEleccionesDisponibles(Authentication authentication) {
        try {
            return new ResponseEntity<>(candidaturaService.listarEleccionesDisponibles(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/mis-postulaciones")
    public ResponseEntity<?> listarMisPostulaciones(Authentication authentication) {
        try {
            return new ResponseEntity<>(candidaturaService.listarMisPostulaciones(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/postulantes-registrados")
    public ResponseEntity<?> listarPostulantesRegistrados(Authentication authentication) {
        try {
            return new ResponseEntity<>(candidaturaService.listarPostulantesRegistrados(authentication), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping
    public ResponseEntity<?> postularme(@RequestBody PostulacionRequestDTO dto, Authentication authentication) {
        try {
            return new ResponseEntity<>(candidaturaService.postularme(dto, authentication), HttpStatus.CREATED);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
