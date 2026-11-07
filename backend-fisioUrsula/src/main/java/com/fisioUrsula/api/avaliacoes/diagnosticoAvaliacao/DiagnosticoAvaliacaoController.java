package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/diagnosticos-avaliacoes")
@RequiredArgsConstructor
public class DiagnosticoAvaliacaoController {

    private final DiagnosticoAvaliacaoService diagnosticoAvaliacaoService;

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