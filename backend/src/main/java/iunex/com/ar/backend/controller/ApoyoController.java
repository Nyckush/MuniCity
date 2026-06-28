package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.ApoyoDTO;
import iunex.com.ar.backend.model.Apoyo;
import iunex.com.ar.backend.service.ApoyoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apoyos")
@CrossOrigin(origins = "*")
public class ApoyoController {

    @Autowired
    private ApoyoService apoyoService;

    @PostMapping
    public ResponseEntity<?> crearApoyo(@RequestBody ApoyoDTO dto) {
        try {
            Apoyo apoyo = apoyoService.guardarApoyo(dto);
            return new ResponseEntity<>(apoyo, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Apoyo>> listarApoyos() {
        return new ResponseEntity<>(apoyoService.obtenerTodos(), HttpStatus.OK);
    }
}
