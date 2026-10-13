package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirComorbidadeResponseDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/comorbidades")
public class PacienteComorbidadeController {

    private final PacienteComorbidadeService pacienteComorbidadeService;

    @PostMapping
    public ResponseEntity<CadastrarComorbidadeResponseDTO> cadastrarComorbidade(
            @Valid @RequestBody CadastrarComorbidadeRequestDTO dto) {
        CadastrarComorbidadeResponseDTO comorbidade = pacienteComorbidadeService.cadastrarComorbidade(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(comorbidade);
    }

    @PostMapping("/{pacienteId}")
    public ResponseEntity<AtribuirComorbidadeResponseDTO> atribuirComorbidade(@PathVariable Long pacienteId,
            @RequestBody @Valid AtribuirComorbidadeRequestDTO dto) {
        AtribuirComorbidadeResponseDTO pacienteComorbidade = pacienteComorbidadeService.atribuirComorbidade(pacienteId,
                dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteComorbidade);
    }
}
