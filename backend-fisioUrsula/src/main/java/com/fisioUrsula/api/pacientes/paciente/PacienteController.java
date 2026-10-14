package com.fisioUrsula.api.pacientes.paciente;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.fisioUrsula.api.pacientes.paciente.dtos.CadastarPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteRequestDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.DetalharPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.ListarPacienteResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteService pacienteService;

    @PostMapping
    public ResponseEntity<CadastarPacienteResponseDTO> cadastrarPaciente(
            @Valid @RequestBody CadastrarPacienteRequestDTO dto) {

        CadastarPacienteResponseDTO paciente = pacienteService.cadastrarPaciente(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(paciente);
    }

    @GetMapping
    public ResponseEntity<List<ListarPacienteResponseDTO>> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) FaixaEtaria faixaEtaria,
            @RequestParam(required = false) Long comorbidadeId,
            @RequestParam(defaultValue = "true") boolean ativo) {

        return ResponseEntity.ok(pacienteService.listar(nome, faixaEtaria, comorbidadeId, ativo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalharPacienteResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalharPacienteResponseDTO> atualizar(@PathVariable Long id,
                                                                 @Valid @RequestBody CadastrarPacienteRequestDTO dto) {
        return ResponseEntity.ok(pacienteService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        pacienteService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}