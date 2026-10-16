package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoRequestDTO;
import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoResponseDTO;
import com.fisioUrsula.api.atendimentos.atendimento.dtos.DetalharAtendimentoResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    public ResponseEntity<DetalharAtendimentoResponseDTO> detalharAtendimento(@PathVariable Long id){
        DetalharAtendimentoResponseDTO detalharAtendimentoResponseDTO = atendimentoService.detalharAtendimento(id);

        return ResponseEntity.status(HttpStatus.OK).body(detalharAtendimentoResponseDTO);
    }
}
