package com.fisioUrsula.api.agendamentos.agendamentoAvaliacao;

import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.dtos.AgendarAvaliacaoRequestDTO;
import com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.dtos.AgendarAvaliacaoResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("agendamento_avaliacao")
public class AgendamentoAvaliacaoController {

    private final AgendamentoAvaliacaoService agendamentoAvaliacaoService;

    @PostMapping("{pacienteId}")
    public ResponseEntity<AgendarAvaliacaoResponseDTO> agendarAvaliacao(@PathVariable Long pacienteId,
            @RequestBody @Valid AgendarAvaliacaoRequestDTO dto) {
        AgendarAvaliacaoResponseDTO agendamentoAvaliacao = agendamentoAvaliacaoService.AgendarAvaliacao(pacienteId,
                dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoAvaliacao);
    }

}
