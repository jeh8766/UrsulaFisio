package com.fisioUrsula.api.financeiro.despesas;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fisioUrsula.api.financeiro.despesas.dtos.CadastrarDespesaRequestDTO;
import com.fisioUrsula.api.financeiro.despesas.dtos.DetalharDespesaResponseDTO;
import com.fisioUrsula.api.shared.enums.CategoriaDespesa;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/despesas")
public class DespesaController {

    private final DespesaService despesaService;

    @PostMapping
    public ResponseEntity<DetalharDespesaResponseDTO> cadastrar(
            @Valid @RequestBody CadastrarDespesaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(despesaService.cadastrar(dto));
    }

    @GetMapping
    public ResponseEntity<List<DetalharDespesaResponseDTO>> listar(
            @RequestParam(required = false) CategoriaDespesa categoria,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) String busca) {
        return ResponseEntity.ok(despesaService.listar(categoria, inicio, fim, busca));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalharDespesaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(despesaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalharDespesaResponseDTO> atualizar(@PathVariable Long id,
                                                                @Valid @RequestBody CadastrarDespesaRequestDTO dto) {
        return ResponseEntity.ok(despesaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        despesaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}