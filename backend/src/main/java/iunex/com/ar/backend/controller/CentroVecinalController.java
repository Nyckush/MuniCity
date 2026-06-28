package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.CentroVecinalDTO;
import iunex.com.ar.backend.model.CentroVecinal;
import iunex.com.ar.backend.service.CentroVecinalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/centros-vecinales")
@CrossOrigin(origins = "*")
public class CentroVecinalController {

    @Autowired
    private CentroVecinalService centroVecinalService;

    @PostMapping
    public ResponseEntity<?> crearCentroVecinal(@RequestBody CentroVecinalDTO dto) {
        try {
            CentroVecinal centroVecinal = centroVecinalService.guardarCentroVecinal(dto);
            return new ResponseEntity<>(centroVecinal, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<CentroVecinal>> listarCentrosVecinales() {
        return new ResponseEntity<>(centroVecinalService.obtenerTodos(), HttpStatus.OK);
    }
}
