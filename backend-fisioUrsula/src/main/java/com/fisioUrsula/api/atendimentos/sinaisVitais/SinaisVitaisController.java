package com.fisioUrsula.api.atendimentos.sinaisVitais;


import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.AtualizarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.DetalharSinaisVitaisResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/sinais_vitais")
public class SinaisVitaisController {


    public final SinaisVitaisService sinaisVitaisService;

    @PostMapping
    public ResponseEntity<CriarSinaisVitaisResponseDTO> criarSinaisVitais(@Valid @RequestBody CriarSinaisVitaisRequestDTO criarSinaisVitaisRequestDTO) {

        CriarSinaisVitaisResponseDTO criarSinaisVitaisResponseDTO = sinaisVitaisService.criarSinaisVitais(criarSinaisVitaisRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(criarSinaisVitaisResponseDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalharSinaisVitaisResponseDTO> detalharSinaisVitais(@PathVariable Long id){

        DetalharSinaisVitaisResponseDTO detalharSinaisVitaisResponseDTO = sinaisVitaisService.detalharSinaisVitais(id);

        return ResponseEntity.ok().body(detalharSinaisVitaisResponseDTO);
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharSinaisVitaisResponseDTO> atualizarSinaisVitais(@PathVariable Long id, @Valid @RequestBody AtualizarSinaisVitaisRequestDTO dto){

        DetalharSinaisVitaisResponseDTO detalharSinaisVitaisResponseDTO = sinaisVitaisService.atualizarSinaisVitais(id, dto);

        return ResponseEntity.ok().body(detalharSinaisVitaisResponseDTO);
    }

    @GetMapping("/atendimento/{atendimentoId}")
    public ResponseEntity<DetalharSinaisVitaisResponseDTO> BuscarSinaisVitaisPorAtendimento(@PathVariable Long atendimentoId){

        DetalharSinaisVitaisResponseDTO detalharSinaisVitaisResponseDTO = sinaisVitaisService.BuscarSinaisVitaisPorAtendimento(atendimentoId);

        return ResponseEntity.ok().body(detalharSinaisVitaisResponseDTO);
    }
}
