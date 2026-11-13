package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtualizarPacienteComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.DetalharPacienteComorbidadeResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirPacienteComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirPacienteComorbidadeResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/paciente-comorbidade")
public class PacienteComorbidadeController {

    private final PacienteComorbidadeService pacienteComorbidadeService;


    @PostMapping("/paciente/{pacienteId}")
    public ResponseEntity<AtribuirPacienteComorbidadeResponseDTO> atribuirPacienteComorbidade(@PathVariable Long pacienteId, @RequestBody @Valid AtribuirPacienteComorbidadeRequestDTO dto) {
        AtribuirPacienteComorbidadeResponseDTO pacienteComorbidade = pacienteComorbidadeService.atribuirComorbidadePaciente(pacienteId,
                dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteComorbidade);
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<DetalharPacienteComorbidadeResponseDTO>> listarComorbidadesPorPaciente(
            @PathVariable Long pacienteId) {

        return ResponseEntity.ok(
                pacienteComorbidadeService.listarComorbidadesPorPaciente(pacienteId)
        );
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharPacienteComorbidadeResponseDTO> atualizarPacienteComorbidade(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarPacienteComorbidadeRequestDTO dto) {

        return ResponseEntity.ok(
                pacienteComorbidadeService.atualizarPacienteComorbidade(id, dto)
        );
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarPacienteComorbidade(
            @PathVariable Long id) {

        pacienteComorbidadeService.inativarPacienteComorbidade(id);

        return ResponseEntity.noContent().build();
    }


}
