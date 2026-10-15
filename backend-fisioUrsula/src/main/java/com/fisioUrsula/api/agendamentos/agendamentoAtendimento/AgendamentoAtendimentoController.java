package com.fisioUrsula.api.agendamentos.agendamentoAtendimento;


import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.dtos.CriarAgendamentoAtendimentoRequestDTO;
import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.dtos.CriarAgendamentoAtendimentoResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/agendamento_atendimento")
@RequiredArgsConstructor
public class AgendamentoAtendimentoController {

    public final AgendamentoAtendimentoService agendamentoAtendimentoService;

    @PostMapping
    public ResponseEntity<CriarAgendamentoAtendimentoResponseDTO> criarAgendamentoAtendimento(@Valid @RequestBody CriarAgendamentoAtendimentoRequestDTO criarAgendamentoAtendimentoRequestDTO) {

        CriarAgendamentoAtendimentoResponseDTO criarAgendamentoAtendimentoResponseDTO = agendamentoAtendimentoService.criarAgendamentoAtendimento(criarAgendamentoAtendimentoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(criarAgendamentoAtendimentoResponseDTO);
    }
}
