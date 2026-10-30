package com.fisioUrsula.api.atendimentos.sinaisVitais;

import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.AtualizarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.DetalharSinaisVitaisResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sinais_vitais")
@CrossOrigin(origins = "http://localhost:5173")
public class SinaisVitaisController {

    private final SinaisVitaisService sinaisVitaisService;

    @PostMapping
    public ResponseEntity<CriarSinaisVitaisResponseDTO> criarSinaisVitais(
            @Valid @RequestBody CriarSinaisVitaisRequestDTO dto
    ) {
        CriarSinaisVitaisResponseDTO resposta =
                sinaisVitaisService.criarSinaisVitais(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalharSinaisVitaisResponseDTO> detalharSinaisVitais(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                sinaisVitaisService.detalharSinaisVitais(id)
        );
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharSinaisVitaisResponseDTO> atualizarSinaisVitais(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarSinaisVitaisRequestDTO dto
    ) {
        return ResponseEntity.ok(
                sinaisVitaisService.atualizarSinaisVitais(id, dto)
        );
    }

    @GetMapping("/atendimento/{atendimentoId}")
    public ResponseEntity<DetalharSinaisVitaisResponseDTO> buscarSinaisVitaisPorAtendimento(
            @PathVariable Long atendimentoId
    ) {
        return ResponseEntity.ok(
                sinaisVitaisService.BuscarSinaisVitaisPorAtendimento(atendimentoId)
        );
    }
}
