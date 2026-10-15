package com.fisioUrsula.api.atendimentos.sinaisVitais;


import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

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
}
