package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;

public record CriarAtendimentoRequestDTO(

                @NotNull
                BigDecimal valor,
                @NotNull
                BigDecimal taxaDeslocamento,
                @NotNull
                Long agendamentoId,
                @NotNull
                Long sinaisVitaisId

) {
}
