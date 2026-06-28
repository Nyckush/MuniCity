package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.ObservacionDTO;
import iunex.com.ar.backend.model.Observacion;
import iunex.com.ar.backend.service.ObservacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/observaciones")
@CrossOrigin(origins = "*")
public class ObservacionController {

    @Autowired
    private ObservacionService observacionService;

    @PostMapping
    public ResponseEntity<?> crearObservacion(@RequestBody ObservacionDTO dto) {
        try {
            Observacion observacion = observacionService.guardarObservacion(dto);
            return new ResponseEntity<>(observacion, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Observacion>> listarObservaciones() {
        return new ResponseEntity<>(observacionService.obtenerTodas(), HttpStatus.OK);
    }
}
