package com.fisioUrsula.api.avaliacoes.diagnosticos;

import com.fisioUrsula.api.avaliacoes.diagnosticos.dtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/diagnosticos")
@RequiredArgsConstructor
public class DiagnosticoController {

    private final DiagnosticoService diagnosticoService;

    @PostMapping
    public ResponseEntity<CriarDiagnosticoResponseDTO> criarDiagnostico(@Valid @RequestBody CriarDiagnosticoRequestDTO dto) {
        CriarDiagnosticoResponseDTO criarDiagnosticoResponseDTO = diagnosticoService.criarDiagnostico(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criarDiagnosticoResponseDTO);
    }

    @GetMapping
    public ResponseEntity<List<ListarDiagnosticoResponseDTO>> listarDiagnosticos(@RequestParam(required = false) String nome) {
        return ResponseEntity.ok(diagnosticoService.listarDiagnosticos(nome));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListarDiagnosticoResponseDTO> buscarDiagnosticoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(diagnosticoService.buscarDiagnosticoPorId(id));
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharDiagnosticoResponseDTO> atualizarDiagnostico(@PathVariable Long id, @Valid @RequestBody AtualizarDiagnosticoRequestDTO dto) {
        DetalharDiagnosticoResponseDTO detalharDiagnosticoResponseDTO = diagnosticoService.atualizarDiagnostico(id, dto);
        return ResponseEntity.ok(detalharDiagnosticoResponseDTO);
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativardiagnostico(@PathVariable Long id) {
        diagnosticoService.inativarDiagnostico(id);
        return ResponseEntity.noContent().build();
    }
}