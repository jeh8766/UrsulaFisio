package com.fisioUrsula.api.avaliacoes.avaliacao.dto;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CriarAvaliacaoRequestDTO(
        @Size(max = 60)
        @NotBlank
        String queixaPrincipal,
        String observacao,
        @NotNull
        @Positive
        BigDecimal valor,
        @NotNull
        Long agendamentoId
) {
    public CriarAvaliacaoRequestDTO (Avaliacao avaliacao){
        this(
                avaliacao.getQueixaPrincipal(),
                avaliacao.getObservacao(),
                avaliacao.getValor(),
                avaliacao.getAgendamento().getId()
        );
    }
}
