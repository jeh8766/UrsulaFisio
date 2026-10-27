package com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos.AdicionarExercicioAoPlanoRequestDTO;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos.AtualizarObservacaoPlanoExercicioRequestDTO;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos.DetalharPlanoExercicioResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/planos-tratamento/{planoId}/exercicios")
public class PlanoExercicioController {

    private final PlanoExercicioService planoExercicioService;

    @PostMapping
    public ResponseEntity<DetalharPlanoExercicioResponseDTO> adicionarExercicioAoPlano(
            @PathVariable Long planoId,
            @Valid @RequestBody AdicionarExercicioAoPlanoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(planoExercicioService.adicionarExercicioAoPlano(planoId, dto));
    }

    @GetMapping
    public ResponseEntity<List<DetalharPlanoExercicioResponseDTO>> listarExerciciosDoPlano(
            @PathVariable Long planoId) {
        return ResponseEntity.ok(planoExercicioService.listarExerciciosDoPlano(planoId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DetalharPlanoExercicioResponseDTO> atualizarObservacao(
            @PathVariable Long planoId,
            @PathVariable Long id,
            @Valid @RequestBody AtualizarObservacaoPlanoExercicioRequestDTO dto) {
        return ResponseEntity.ok(planoExercicioService.atualizarObservacao(planoId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerExercicioDoPlano(@PathVariable Long planoId, @PathVariable Long id) {
        planoExercicioService.removerExercicioDoPlano(planoId, id);
        return ResponseEntity.noContent().build();
    }
}