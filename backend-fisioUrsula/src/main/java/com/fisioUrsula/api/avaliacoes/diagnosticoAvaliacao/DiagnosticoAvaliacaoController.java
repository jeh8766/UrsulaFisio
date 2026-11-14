package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.util.List;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.DetalharDiagnosticoAvaliacaoResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtribuirDiagnosticoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtualizarDiagnosticoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.ListarDiagnosticosAvaliacaoResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/diagnosticos-avaliacoes")
@RequiredArgsConstructor
public class DiagnosticoAvaliacaoController {

    private final DiagnosticoAvaliacaoService diagnosticoAvaliacaoService;

    @PostMapping
    public ResponseEntity<DetalharDiagnosticoAvaliacaoResponseDTO> atribuirDiagnosticoAvaliacao(@Valid @RequestBody AtribuirDiagnosticoAvaliacaoRequestDTO dto) {
        DetalharDiagnosticoAvaliacaoResponseDTO detalharDiagnosticoAvaliacaoResponseDTO = diagnosticoAvaliacaoService.atribuirDiagnosticoAvaliacao(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(detalharDiagnosticoAvaliacaoResponseDTO);
    }

    @GetMapping("/avaliacao/{avaliacaoId}")
    public ResponseEntity<List<ListarDiagnosticosAvaliacaoResponseDTO>> listarDiagnosticosDaAvaliacao(@PathVariable Long avaliacaoId) {
        return ResponseEntity.ok(diagnosticoAvaliacaoService.listarDiagnosticosDaAvaliacao(avaliacaoId));
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharDiagnosticoAvaliacaoResponseDTO> atualizarDiagnosticoDaAvaliacao(@PathVariable Long id, @Valid @RequestBody AtualizarDiagnosticoAvaliacaoRequestDTO dto) {
        DetalharDiagnosticoAvaliacaoResponseDTO detalharDiagnosticoAvaliacaoResponseDTO = diagnosticoAvaliacaoService.atualizarDiagnosticoAvaliacao(id, dto);
        return ResponseEntity.ok(detalharDiagnosticoAvaliacaoResponseDTO);
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        diagnosticoAvaliacaoService.inativarDiagnosticoAvaliacao(id);
        return ResponseEntity.noContent().build();
    }
}