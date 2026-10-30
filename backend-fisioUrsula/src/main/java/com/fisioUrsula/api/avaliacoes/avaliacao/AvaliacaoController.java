package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fisioUrsula.api.avaliacoes.avaliacao.dto.AtualizarAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.avaliacao.dto.AtualizarAvaliacaoResponseDTO;
import com.fisioUrsula.api.avaliacoes.avaliacao.dto.AtualizarStatusAtendimentoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.avaliacao.dto.ListarAvaliacoesResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @PutMapping("/{id}")
    public ResponseEntity<AtualizarAvaliacaoResponseDTO> atualizarAvaliacao(@PathVariable Long id,
            @Valid @RequestBody AtualizarAvaliacaoRequestDTO dto) {

        AtualizarAvaliacaoResponseDTO avaliacaoSalva = avaliacaoService.atualizarAvaliacao(id, dto);

        return ResponseEntity.status(HttpStatus.OK).body(avaliacaoSalva);
    }

    @PatchMapping("atualizarStatus/{id}")
    public ResponseEntity<Void> atualizarStatusAtendimento(@PathVariable Long id,
            @Valid @RequestBody AtualizarStatusAtendimentoAvaliacaoRequestDTO dto) {

        avaliacaoService.atualizarStatusAtendimento(id, dto);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ListarAvaliacoesResponseDTO>> listarAvaliacoes() {
        return ResponseEntity.ok(avaliacaoService.listarAvaliacoes());
    }

}
