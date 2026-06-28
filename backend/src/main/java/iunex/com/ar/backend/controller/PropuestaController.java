package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.PropuestaDTO;
import iunex.com.ar.backend.model.Propuesta;
import iunex.com.ar.backend.service.PropuestaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propuestas")
@CrossOrigin(origins = "*")
public class PropuestaController {

    @Autowired
    private PropuestaService propuestaService;

    @PostMapping
    public ResponseEntity<?> crearPropuesta(@RequestBody PropuestaDTO dto) {
        try {
            Propuesta propuesta = propuestaService.guardarPropuesta(dto);
            return new ResponseEntity<>(propuesta, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Propuesta>> listarPropuestas() {
        return new ResponseEntity<>(propuestaService.obtenerTodas(), HttpStatus.OK);
    }
}
