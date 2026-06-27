package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.RegistroCiudadanoDTO;
import iunex.com.ar.backend.service.CiudadanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ciudadanos") // Ruta base para todos los endpoints de esta clase
@CrossOrigin(origins = "*") // Permite que tu frontend (ej. React/Angular) se conecte sin bloqueos de CORS
public class CiudadanoController {

    @Autowired
    private CiudadanoService ciudadanoService;

    // POST http://localhost:8080/api/ciudadanos/registrar
    @PostMapping("/registrar")
    public ResponseEntity<String> registrar(@RequestBody RegistroCiudadanoDTO dto) {
        try {
            // Llamamos al servicio para que ejecute la lógica de las dos entidades
            ciudadanoService.registrarCiudadano(dto);

            // Si todo sale bien, devolvemos un mensaje de éxito y un estado 201 (Created)
            return new ResponseEntity<>("Ciudadano y usuario registrados con éxito.", HttpStatus.CREATED);

        } catch (RuntimeException e) {
            // Si el servicio lanzó una excepción (DNI repetido, Correo repetido, etc.)
            // capturamos el mensaje y devolvemos un estado 400 (Bad Request)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}