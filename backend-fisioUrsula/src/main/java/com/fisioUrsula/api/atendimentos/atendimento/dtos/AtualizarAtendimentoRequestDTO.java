package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;

import java.math.BigDecimal;

public record AtualizarAtendimentoRequestDTO(

        String intercorrencia,
        String evolucao,
        BigDecimal valor,
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
