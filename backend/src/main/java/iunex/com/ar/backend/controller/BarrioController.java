package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.model.Barrio;
import iunex.com.ar.backend.service.BarrioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/barrios")
@CrossOrigin(origins = "*")
public class BarrioController {

    @Autowired
    private BarrioService barrioService;



    @PostMapping
    public ResponseEntity<?> crearBarrio(@Valid @RequestBody Barrio barrio) {
        try {
            Barrio nuevoBarrio = barrioService.guardarBarrio(barrio);
            return new ResponseEntity<>(nuevoBarrio, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // GET http://localhost:8080/api/barrios
    // Este endpoint lo va a llamar tu frontend para llenar las opciones del <select>
    @GetMapping
    public ResponseEntity<List<Barrio>> listarBarrios() {
        List<Barrio> barrios = barrioService.obtenerTodos();
        return new ResponseEntity<>(barrios, HttpStatus.OK);
    }
}
