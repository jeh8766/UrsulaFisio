package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoRequestDTO;
import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoResponseDTO;
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
@RequestMapping("/atendimentos")
public class AtendimentoController {

    public final AtendimentoService atendimentoService;

    @PostMapping
    public ResponseEntity<CriarAtendimentoResponseDTO> criarAtendimento(@Valid @RequestBody CriarAtendimentoRequestDTO criarAtendimentoRequestDTO){

        CriarAtendimentoResponseDTO atendimentoResponseDTO = atendimentoService.criarAtendimento(criarAtendimentoRequestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(atendimentoResponseDTO);
    }
}
