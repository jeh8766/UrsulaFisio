
package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ConcluirAtendimentoRequestDTO(

        String intercorrencia,

        @NotBlank
        String evolucao,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal valor,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal taxaDeslocamento,

        @NotNull
        Long sinaisVitaisId

) {
}
        