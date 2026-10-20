package com.fisioUrsula.api.avaliacoes.avaliacao.dto;

import java.math.BigDecimal;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

public record AtualizarAvaliacaoResponseDTO(Long id,
        String queixaPrincipal,
        String observacao,
        BigDecimal valor,
        StatusPagamento statusPagamento,
        StatusAtendimento statusAtendimento) {

    public AtualizarAvaliacaoResponseDTO(Avaliacao avaliacao) {
        this(
                avaliacao.getId(),
                avaliacao.getQueixaPrincipal(),
                avaliacao.getObservacao(),
                avaliacao.getValor(),
                avaliacao.getStatusPagamento(),
                avaliacao.getStatusAtendimento());
    }
}
