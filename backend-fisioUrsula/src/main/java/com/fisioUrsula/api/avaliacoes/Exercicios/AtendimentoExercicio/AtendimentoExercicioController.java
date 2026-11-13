package com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio;

import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.dtos.AtribuirAtendimentoExercicioResponseDTO;
import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.dtos.DetalharAtendimentoExercicioResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/atendimento-exercicio")
public class AtendimentoExercicioController {

    private final AtendimentoExercicioService atendimentoExercicioService;

    @PostMapping("/{atendimentoId}/{exercicioId}")
    public ResponseEntity<AtribuirAtendimentoExercicioResponseDTO> atribuirAtendimentoExercicio(@PathVariable Long atendimentoId, @PathVariable Long exercicioId) {

        AtribuirAtendimentoExercicioResponseDTO atribuirAtendimentoExercicioResponseDTO = atendimentoExercicioService.atribuirAtendimentoExercicio(atendimentoId, exercicioId);

        return ResponseEntity.status(HttpStatus.CREATED).body(atribuirAtendimentoExercicioResponseDTO);
    }

    @GetMapping("/{atendimentoId}")
    public ResponseEntity<List<DetalharAtendimentoExercicioResponseDTO>> listarExerciciosPorAtendimento(@PathVariable Long atendimentoId) {

        List<DetalharAtendimentoExercicioResponseDTO> detalharAtendimentoExercicioResponseDTO = atendimentoExercicioService.listarExerciciosPorAtendimento(atendimentoId);

        return ResponseEntity.ok(detalharAtendimentoExercicioResponseDTO);
    }

    @PatchMapping("/{id}/{exercicioId}")
    public ResponseEntity<AtribuirAtendimentoExercicioResponseDTO> atualizarExercicioDoAtendimento(@PathVariable Long id, @PathVariable Long exercicioId){

        AtribuirAtendimentoExercicioResponseDTO atribuirAtendimentoExercicioResponseDTO = atendimentoExercicioService.atualizarExercicioDoAtendimento(id, exercicioId);

        return ResponseEntity.ok(atribuirAtendimentoExercicioResponseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerExercicioDoAtendimento(@PathVariable Long id){

        atendimentoExercicioService.removerExercicioDoAtendimento(id);

        return ResponseEntity.noContent().build();
    }
}
