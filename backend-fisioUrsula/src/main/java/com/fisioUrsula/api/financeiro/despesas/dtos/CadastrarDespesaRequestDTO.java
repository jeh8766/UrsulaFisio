package com.fisioUrsula.api.financeiro.despesas.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fisioUrsula.api.shared.enums.CategoriaDespesa;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CadastrarDespesaRequestDTO(
        @NotBlank(message = "A descrição é obrigatória") @Size(max = 100, message = "A descrição deve ter no máximo 100 caracteres") String descricao,
        @NotNull(message = "A categoria é obrigatória") CategoriaDespesa categoria,
        @NotNull(message = "O valor é obrigatório") @Positive(message = "O valor deve ser maior que zero") @Digits(integer = 8, fraction = 2, message = "Valor inválido") BigDecimal valor,
        @NotNull(message = "A data da despesa é obrigatória") LocalDate dataDespesa,
        String observacao) {
}