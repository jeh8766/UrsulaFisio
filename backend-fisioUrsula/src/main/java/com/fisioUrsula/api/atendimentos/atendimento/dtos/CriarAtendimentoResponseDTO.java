package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import java.math.BigDecimal;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

public record CriarAtendimentoResponseDTO(


        Long id,

        String intercorrencia,

        String evolucao,

        BigDecimal valor,

        BigDecimal taxaDeslocamento,

        StatusAtendimento statusAtendimento,

        StatusPagamento statusPagamento) {
}
