package com.fisioUrsula.api.pacientes.comorbidades;

import com.fisioUrsula.api.pacientes.comorbidades.dtos.AtualizarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.comorbidades.dtos.CadastrarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.comorbidades.dtos.CadastrarComorbidadeResponseDTO;
import com.fisioUrsula.api.pacientes.comorbidades.dtos.DetalharComorbidadeResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/comorbidades")
@CrossOrigin(origins = "http://localhost:5173")
public class ComorbidadeController {

    private final ComorbidadeService comorbidadeService;

    @PostMapping
    public ResponseEntity<CadastrarComorbidadeResponseDTO> cadastrarComorbidade(
            @Valid @RequestBody CadastrarComorbidadeRequestDTO dto) {
        CadastrarComorbidadeResponseDTO comorbidade = comorbidadeService.cadastrarComorbidade(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(comorbidade);
    }

    @GetMapping
    public ResponseEntity<List<DetalharComorbidadeResponseDTO>> listarComorbidades(@RequestParam(required = false) String nome) {
        return ResponseEntity.ok(comorbidadeService.listarComorbidadePorNome(nome));
    }

    @PatchMapping("/{id}/atualizar")
    public ResponseEntity<DetalharComorbidadeResponseDTO> atualizarComorbidade(@PathVariable Long id, @Valid @RequestBody AtualizarComorbidadeRequestDTO dto) {

        DetalharComorbidadeResponseDTO detalharComorbidadeResponseDTO = comorbidadeService.atualizarComorbidade(id, dto);

        return ResponseEntity.ok().body(detalharComorbidadeResponseDTO);
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativarComorbidade(@PathVariable Long id) {

        comorbidadeService.inativarComorbidade(id);
        return ResponseEntity.noContent().build();
    }

}
