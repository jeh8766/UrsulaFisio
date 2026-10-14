package com.fisioUrsula.api.pacientes.paciente;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.fisioUrsula.api.pacientes.paciente.dtos.CadastarPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteRequestDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

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
    public ResponseEntity<List<CadastarPacienteResponseDTO>> listarTodosPacientes() {

        List<CadastarPacienteResponseDTO> pacientes =
                pacienteService.listarTodosPacientes();

        return ResponseEntity.ok(pacientes);
    }
}
