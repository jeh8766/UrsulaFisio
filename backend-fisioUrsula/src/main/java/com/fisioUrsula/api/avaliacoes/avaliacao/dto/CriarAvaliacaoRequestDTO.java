package com.fisioUrsula.api.avaliacoes.avaliacao.dto;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;

import java.math.BigDecimal;

public record CriarAvaliacaoRequestDTO(
        String queixaPrincipal,
        String observacao,
        BigDecimal valor,
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
