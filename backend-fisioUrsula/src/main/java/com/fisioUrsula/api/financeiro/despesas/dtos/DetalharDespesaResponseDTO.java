package com.fisioUrsula.api.financeiro.despesas.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fisioUrsula.api.financeiro.despesas.Despesa;
import com.fisioUrsula.api.shared.enums.CategoriaDespesa;

public record DetalharDespesaResponseDTO(
        Long id,
        String descricao,
        CategoriaDespesa categoria,
        BigDecimal valor,
        LocalDate dataDespesa,
        String observacao) {

    public DetalharDespesaResponseDTO(Despesa despesa) {
        this(despesa.getId(), despesa.getDescricao(), despesa.getCategoria(),
                despesa.getValor(), despesa.getDataDespesa(), despesa.getObservacao());
    }
}