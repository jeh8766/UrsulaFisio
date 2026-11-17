package com.fisioUrsula.api.avaliacoes.avaliacao.dto;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import java.math.BigDecimal;

public record CriarAvaliacaoResponseDTO (
        Long id,
        String queixaPrincipal,
        StatusPagamento statusPagamento,
        StatusAtendimento statusAtendimento,
        String observacao,
        BigDecimal valor
) {
    public CriarAvaliacaoResponseDTO (Avaliacao avaliacao){
        this(
                avaliacao.getId(),
                avaliacao.getQueixaPrincipal(),
                avaliacao.getStatusPagamento(),
                avaliacao.getStatusAtendimento(),
                avaliacao.getObservacao(),
                avaliacao.getValor()
        );
    }
}
