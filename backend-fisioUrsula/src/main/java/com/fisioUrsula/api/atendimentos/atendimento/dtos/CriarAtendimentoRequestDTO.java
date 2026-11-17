package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record CriarAtendimentoRequestDTO(

        @NotNull
        @Positive
        BigDecimal valor,

        @NotNull
        @PositiveOrZero
        BigDecimal taxaDeslocamento,

        @NotNull
        Long agendamentoId

) {}
