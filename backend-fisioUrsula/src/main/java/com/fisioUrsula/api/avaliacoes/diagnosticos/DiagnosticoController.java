package com.fisioUrsula.api.avaliacoes.diagnosticos;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.avaliacoes.diagnosticos.dto.AtualizarDiagnosticoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticos.dto.CriarDiagnosticoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticos.dto.ListarDiagnosticosDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/diagnosticos")
@RequiredArgsConstructor
public class DiagnosticoController {

    private final DiagnosticoService diagnosticoService;

    @PostMapping
    public ResponseEntity<Void> criarDiagnostico(@Valid @RequestBody CriarDiagnosticoDTO dto) {
        diagnosticoService.criarDiagnostico(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<ListarDiagnosticosDTO>> listarDiagnosticos() {
        return ResponseEntity.ok(diagnosticoService.listarDiagnosticos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListarDiagnosticosDTO> buscarDiagnosticoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(diagnosticoService.buscarDiagnosticoPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> atualizarDiagnostico(@PathVariable Long id,
                                                     @Valid @RequestBody AtualizarDiagnosticoDTO dto) {
        diagnosticoService.atualizarDiagnostico(id, dto);
        return ResponseEntity.noContent().build();
    }
}