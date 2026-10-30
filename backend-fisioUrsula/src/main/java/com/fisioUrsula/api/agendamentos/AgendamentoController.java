package com.fisioUrsula.api.agendamentos;

import com.fisioUrsula.api.agendamentos.dtos.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("agendamentos")
@CrossOrigin(origins = "http://localhost:5173")

public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @PostMapping("/avaliacao/{pacienteId}")
    public ResponseEntity<AgendarAvaliacaoResponseDTO> agendarAvaliacao(@PathVariable Long pacienteId,
            @RequestBody @Valid AgendarAvaliacaoRequestDTO dto) {
        AgendarAvaliacaoResponseDTO agendamentoAvaliacao = agendamentoService.AgendarAvaliacao(pacienteId,
                dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoAvaliacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoAgendaResponseDTO> atualizarAgendamento(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarAgendamentoRequestDTO dto
    ) {
        AgendamentoAgendaResponseDTO atualizado =
                agendamentoService.atualizarAgendamento(id, dto);
        return ResponseEntity.ok(atualizado);
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

        agendamentoService.alterarStatusAgendamento(id, dto.statusAgendamento());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoAgendaResponseDTO> buscarPorId(
            @PathVariable Long id
    ) {
        AgendamentoAgendaResponseDTO agendamento =
                agendamentoService.buscarPorId(id);

        return ResponseEntity.ok(agendamento);
    }

    @GetMapping
    public List<AgendamentoAgendaResponseDTO> listarPorPeriodo(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        return agendamentoService.listarPorPeriodo(inicio, fim);
    }

}
