package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record AtualizarAtendimentoRequestDTO(

        String intercorrencia,
        String evolucao,
        @Positive
        BigDecimal valor,
        @PositiveOrZero
        BigDecimal taxaDeslocamento

) {
    public AtualizarAtendimentoRequestDTO(Atendimento atendimento){
        this(
                atendimento.getIntercorrencia(),
                atendimento.getEvolucao(),
                atendimento.getValor(),
                atendimento.getTaxaDeslocamento()
        );
    }
}
