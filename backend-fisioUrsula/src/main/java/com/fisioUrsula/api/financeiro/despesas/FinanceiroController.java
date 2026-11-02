package com.fisioUrsula.api.financeiro.despesas;

import java.time.LocalDate;

import com.fisioUrsula.api.financeiro.despesas.dtos.ResumoFinanceiroResponseDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/financeiro")
@CrossOrigin(origins = "http://localhost:5173")
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @GetMapping("/resumo")
    public ResponseEntity<ResumoFinanceiroResponseDTO> obterResumo(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        return ResponseEntity.ok(
                financeiroService.obterResumo(inicio, fim)
        );
    }
}