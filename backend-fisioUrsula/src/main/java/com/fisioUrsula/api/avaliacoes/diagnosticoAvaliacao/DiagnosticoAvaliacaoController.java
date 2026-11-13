package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.util.List;

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

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtribuirDiagnosticoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtualizarDiagnosticoDaAvaliacaoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.ListarDiagnosticosDaAvaliacaoDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/diagnosticos-avaliacoes")
@RequiredArgsConstructor
public class DiagnosticoAvaliacaoController {

    private final DiagnosticoAvaliacaoService diagnosticoAvaliacaoService;

    @PostMapping
    public ResponseEntity<Void> atribuirDiagnostico(@Valid @RequestBody AtribuirDiagnosticoDTO dto) {
        diagnosticoAvaliacaoService.atribuirDiagnostico(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerDiagnosticoDeAvaliacao(@PathVariable Long id) {
        diagnosticoAvaliacaoService.removerDiagnosticoDeAvaliacao(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> atualizarDiagnosticoDaAvaliacao(@PathVariable Long id,
                                                                @Valid @RequestBody AtualizarDiagnosticoDaAvaliacaoDTO dto) {
        diagnosticoAvaliacaoService.atualizarDiagnosticoDaAvaliacao(id, dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/avaliacao/{avaliacaoId}")
    public ResponseEntity<List<ListarDiagnosticosDaAvaliacaoDTO>> listarDiagnosticosDaAvaliacao(
            @PathVariable Long avaliacaoId) {
        return ResponseEntity.ok(diagnosticoAvaliacaoService.listarDiagnosticosDaAvaliacao(avaliacaoId));
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativar(@PathVariable Long id) {
        diagnosticoAvaliacaoService.ativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        diagnosticoAvaliacaoService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}