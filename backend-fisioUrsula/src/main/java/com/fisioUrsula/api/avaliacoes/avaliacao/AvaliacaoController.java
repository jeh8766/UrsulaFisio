package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.time.LocalDate;
import java.util.List;

import com.fisioUrsula.api.avaliacoes.avaliacao.dto.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @PostMapping
    public ResponseEntity<CriarAvaliacaoResponseDTO> criarAvaliacao(@Valid @RequestBody CriarAvaliacaoRequestDTO dto){

        CriarAvaliacaoResponseDTO criarAvaliacaoResponseDTO = avaliacaoService.criarAvaliacao(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(criarAvaliacaoResponseDTO);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AtualizarAvaliacaoResponseDTO> atualizarAvaliacao(@PathVariable Long id,
                                                                            @Valid @RequestBody AtualizarAvaliacaoRequestDTO dto) {

        AtualizarAvaliacaoResponseDTO avaliacaoSalva = avaliacaoService.atualizarAvaliacao(id, dto);

        return ResponseEntity.status(HttpStatus.OK).body(avaliacaoSalva);
    }

    @PatchMapping("atualizarStatus/{id}")
    public ResponseEntity<Void> concluirAvaliacao(@PathVariable Long id) {

        avaliacaoService.concluirAvaliacao(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pagamento")
    public ResponseEntity<Void> registrarPagamento(@PathVariable Long id) {
        avaliacaoService.RegistrarPagamento(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ListarAvaliacoesResponseDTO>> listarAvaliacoes() {
        return ResponseEntity.ok(avaliacaoService.listarAvaliacoes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListarAvaliacoesResponseDTO> buscarAvaliacaoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(avaliacaoService.buscarAvaliacaoPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<ListarAvaliacoesResponseDTO>> listarAvaliacoesDePaciente(
            @PathVariable Long pacienteId) {
        return ResponseEntity.ok(avaliacaoService.listarAvaliacoesDePaciente(pacienteId));
    }

    @GetMapping("/data")
    public ResponseEntity<List<ListarAvaliacoesResponseDTO>> listarAvaliacoesPorData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(avaliacaoService.listarAvaliacoesPorData(data));
    }

}