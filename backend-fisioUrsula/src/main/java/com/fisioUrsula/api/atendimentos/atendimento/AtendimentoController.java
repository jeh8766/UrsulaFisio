
package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/atendimentos")
public class AtendimentoController {

    private final AtendimentoService atendimentoService;

    @PostMapping("/agendamento/{agendamentoId}/realizar")
    public ResponseEntity<DetalharAtendimentoResponseDTO> realizarAtendimento(
            @PathVariable Long agendamentoId,
            @Valid @RequestBody ConcluirAtendimentoRequestDTO dto
    ) {

        return ResponseEntity.ok(
                atendimentoService.realizarAtendimento(agendamentoId, dto)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalharAtendimentoResponseDTO> detalharAtendimento(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                atendimentoService.detalharAtendimento(id)
        );
    }

    @PatchMapping("/{id}/pagamento")
    public ResponseEntity<Void> registrarPagamento(
            @PathVariable Long id
    ) {

        atendimentoService.registrarPagamento(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ListarAtendimentosResponseDTO>> listarAtendimentos() {

        return ResponseEntity.ok(
                atendimentoService.listarAtendimentos()
        );
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharAtendimentoResponseDTO> atualizarAtendimento(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarAtendimentoRequestDTO dto
    ) {

        return ResponseEntity.ok(
                atendimentoService.atualizarAtendimento(id, dto)
        );
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<DetalharAtendimentoResponseDTO>> listarAtendimentoPorPaciente(
            @PathVariable Long pacienteId
    ) {

        return ResponseEntity.ok(
                atendimentoService.listarAtendimentoPorPaciente(pacienteId)
        );
    }

    @GetMapping("/data")
    public ResponseEntity<List<DetalharAtendimentoResponseDTO>> listarAtendimentosPorData(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFim
    ) {

        return ResponseEntity.ok(
                atendimentoService.listarAtendimentosPorData(dataInicio, dataFim)
        );
    }
}

