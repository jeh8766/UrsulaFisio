package com.fisioUrsula.api.avaliacoes.avaliacao.dto;

import java.math.BigDecimal;

import com.fisioUrsula.api.shared.enums.StatusPagamento;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record AtualizarAvaliacaoRequestDTO(
        @Size(max = 60, message = "A queixa principal deve ter até 60 caracteres.") String queixaPrincipal,

        String observacao,

        @DecimalMin(value = "0.00", inclusive = false, message = "O valor deve ser maior que zero.") BigDecimal valor,

        StatusPagamento statusPagamento) {

}
