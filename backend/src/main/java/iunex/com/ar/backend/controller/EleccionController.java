package iunex.com.ar.backend.controller;

import iunex.com.ar.backend.dto.CrearEleccionDTO;
import iunex.com.ar.backend.dto.EleccionDTO;
import iunex.com.ar.backend.service.EleccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elecciones")
@CrossOrigin(origins = "*")
public class EleccionController {

    @Autowired
    private EleccionService eleccionService;

    @PostMapping
    public ResponseEntity<?> crearEleccion(@RequestBody CrearEleccionDTO dto, Authentication authentication) {
        if (!esMunicipio(authentication)) {
            return new ResponseEntity<>("Solo el municipio puede convocar elecciones.", HttpStatus.FORBIDDEN);
        }

        try {
            return new ResponseEntity<>(eleccionService.crearEleccion(dto), HttpStatus.CREATED);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{eleccionId}")
    public ResponseEntity<?> editarEleccion(
            @PathVariable Long eleccionId,
            @RequestBody CrearEleccionDTO dto,
            Authentication authentication
    ) {
        if (!esMunicipio(authentication)) {
            return new ResponseEntity<>("Solo el municipio puede editar elecciones.", HttpStatus.FORBIDDEN);
        }

        try {
            return new ResponseEntity<>(eleccionService.actualizarEleccion(eleccionId, dto), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/{eleccionId}/finalizar")
    public ResponseEntity<?> finalizarEleccion(@PathVariable Long eleccionId, Authentication authentication) {
        if (!esMunicipio(authentication)) {
            return new ResponseEntity<>("Solo el municipio puede finalizar elecciones.", HttpStatus.FORBIDDEN);
        }

        try {
            return new ResponseEntity<>(eleccionService.finalizarEleccion(eleccionId), HttpStatus.OK);
        } catch (RuntimeException exception) {
            return new ResponseEntity<>(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<?> listarElecciones(Authentication authentication) {
        if (!esMunicipio(authentication)) {
            return new ResponseEntity<>("Solo el municipio puede consultar elecciones desde este panel.", HttpStatus.FORBIDDEN);
        }

        List<EleccionDTO> elecciones = eleccionService.listarElecciones();
        return new ResponseEntity<>(elecciones, HttpStatus.OK);
    }

    @GetMapping("/detalle")
    public ResponseEntity<?> listarEleccionesConDetalle(Authentication authentication) {
        if (!esMunicipio(authentication)) {
            return new ResponseEntity<>("Solo el municipio puede consultar elecciones desde este panel.", HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(eleccionService.listarEleccionesConDetalle(), HttpStatus.OK);
    }

    private boolean esMunicipio(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_MUNICIPIO".equals(authority.getAuthority()));
    }
}
