package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/atendimentos")
public class AtendimentoController {

    public final AtendimentoService atendimentoService;

    @PostMapping
    public ResponseEntity<CriarAtendimentoResponseDTO> criarAtendimento(@Valid @RequestBody CriarAtendimentoRequestDTO criarAtendimentoRequestDTO) {

        CriarAtendimentoResponseDTO atendimentoResponseDTO = atendimentoService.criarAtendimento(criarAtendimentoRequestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(atendimentoResponseDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalharAtendimentoResponseDTO> detalharAtendimento(@PathVariable Long id) {
        DetalharAtendimentoResponseDTO detalharAtendimentoResponseDTO = atendimentoService.detalharAtendimento(id);

        return ResponseEntity.status(HttpStatus.OK).body(detalharAtendimentoResponseDTO);
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<DetalharAtendimentoResponseDTO> concluirAtendimento(@Valid @RequestBody ConcluirAtendimentoRequestDTO dto, @PathVariable Long id) {

        DetalharAtendimentoResponseDTO detalharAtendimentoResponseDTO = atendimentoService.concluirAtendimento(id, dto);

        return ResponseEntity.status(HttpStatus.OK).body(detalharAtendimentoResponseDTO);
    }

    @PatchMapping("/{id}/pagamento")
    public ResponseEntity<Void> registrarPagamento(@PathVariable Long id) {

        atendimentoService.registrarPagamento(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ListarAtendimentosResponseDTO>> listarAtendimentos() {
        return ResponseEntity.ok().body(atendimentoService.listarAtendimentos());
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharAtendimentoResponseDTO> atualizarAtendimento(@PathVariable Long id, @Valid @RequestBody AtualizarAtendimentoRequestDTO dto) {

        DetalharAtendimentoResponseDTO detalharAtendimentoResponseDTO = atendimentoService.atualizarAtendimento(id, dto);

        return ResponseEntity.ok().body(detalharAtendimentoResponseDTO);
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<DetalharAtendimentoResponseDTO>> listarAtendimentoPorPaciente(@PathVariable Long pacienteId) {

        return ResponseEntity.ok().body(atendimentoService.listarAtendimentoPorPaciente(pacienteId));
    }

    @GetMapping("/data")
    public ResponseEntity<List<DetalharAtendimentoResponseDTO>> listarAtendimentosPorData(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
                                                                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim){
        List<DetalharAtendimentoResponseDTO> atendimentos = atendimentoService.listarAtendimentosPorData(dataInicio, dataFim);

        return ResponseEntity.ok(atendimentos);
    }


}
