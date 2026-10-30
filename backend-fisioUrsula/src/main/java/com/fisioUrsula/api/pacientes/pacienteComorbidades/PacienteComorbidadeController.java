package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirComorbidadeResponseDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeResponseDTO;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    @GetMapping
    public ResponseEntity<List<CadastrarComorbidadeResponseDTO>> listarComorbidades(
            @RequestParam(required = false) String nome) {

        return ResponseEntity.ok(
                pacienteComorbidadeService.listarComorbidades(nome)
        );
    }
    @PostMapping("/{pacienteId}")
    public ResponseEntity<AtribuirComorbidadeResponseDTO> atribuirComorbidade(@PathVariable Long pacienteId,
            @RequestBody @Valid AtribuirComorbidadeRequestDTO dto) {
        AtribuirComorbidadeResponseDTO pacienteComorbidade = pacienteComorbidadeService.atribuirComorbidade(pacienteId,
                dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteComorbidade);
    }
}
