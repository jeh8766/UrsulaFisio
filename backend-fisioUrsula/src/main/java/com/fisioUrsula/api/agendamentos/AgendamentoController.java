package com.fisioUrsula.api.agendamentos;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.agendamentos.dtos.AgendarAvaliacaoRequestDTO;
import com.fisioUrsula.api.agendamentos.dtos.AgendarAvaliacaoResponseDTO;
import com.fisioUrsula.api.agendamentos.dtos.AlterarStatusAgendamentoRequestDTO;
import com.fisioUrsula.api.agendamentos.dtos.CriarAgendamentoAtendimentoRequestDTO;
import com.fisioUrsula.api.agendamentos.dtos.CriarAgendamentoAtendimentoResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("agendamento")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @PostMapping("/avaliacao/{pacienteId}")
    public ResponseEntity<AgendarAvaliacaoResponseDTO> agendarAvaliacao(@PathVariable Long pacienteId,
            @RequestBody @Valid AgendarAvaliacaoRequestDTO dto) {
        AgendarAvaliacaoResponseDTO agendamentoAvaliacao = agendamentoService.AgendarAvaliacao(pacienteId,
                dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoAvaliacao);
    }

    @PostMapping("/atendimento/{pacienteId}")
    public ResponseEntity<CriarAgendamentoAtendimentoResponseDTO> criarAgendamentoAtendimento(
            @PathVariable Long pacienteId,
            @Valid @RequestBody CriarAgendamentoAtendimentoRequestDTO criarAgendamentoAtendimentoRequestDTO) {

        CriarAgendamentoAtendimentoResponseDTO criarAgendamentoAtendimentoResponseDTO = agendamentoService
                .criarAgendamentoAtendimento(pacienteId, criarAgendamentoAtendimentoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(criarAgendamentoAtendimentoResponseDTO);
    }

    @PatchMapping("/status/{id}")
    public ResponseEntity<Void> alterarStatus(@PathVariable Long id,
            @Valid @RequestBody AlterarStatusAgendamentoRequestDTO dto) {

        agendamentoService.alterarStatus(id, dto.statusAgendamento());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
