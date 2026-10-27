package com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.dtos.CadastrarExercicioRequestDTO;
import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.dtos.DetalharExercicioResponseDTO;
import com.fisioUrsula.api.shared.enums.TipoExercicio;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/exercicios")
public class ExercicioController {

    private final ExercicioService exercicioService;

    @PostMapping
    public ResponseEntity<DetalharExercicioResponseDTO> cadastrarExercicio(
            @Valid @RequestBody CadastrarExercicioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exercicioService.cadastrarExercicio(dto));
    }

    @GetMapping
    public ResponseEntity<List<DetalharExercicioResponseDTO>> listarExercicios(
            @RequestParam(required = false) TipoExercicio tipo,
            @RequestParam(defaultValue = "true") boolean ativo) {
        return ResponseEntity.ok(exercicioService.listarExercicios(tipo, ativo));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<DetalharExercicioResponseDTO>> buscarExercicioPorNome(
            @RequestParam String nome) {
        return ResponseEntity.ok(exercicioService.buscarExercicioPorNome(nome));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalharExercicioResponseDTO> buscarExercicioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(exercicioService.buscarExercicioPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalharExercicioResponseDTO> atualizarExercicio(@PathVariable Long id,
                                                                           @Valid @RequestBody CadastrarExercicioRequestDTO dto) {
        return ResponseEntity.ok(exercicioService.atualizarExercicio(id, dto));
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarExercicio(@PathVariable Long id) {
        exercicioService.inativarExercicio(id);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarExercicio(@PathVariable long id) {
        exercicioService.ativarExercicio(id);
        return ResponseEntity.noContent().build();
    }
}