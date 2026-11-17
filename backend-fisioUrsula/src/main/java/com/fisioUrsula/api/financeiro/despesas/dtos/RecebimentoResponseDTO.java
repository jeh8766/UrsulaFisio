
package com.fisioUrsula.api.financeiro.despesas.dtos;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecebimentoResponseDTO(
        Long atendimentoId,
        LocalDate dataPagamento,
        String pacienteNome,
        BigDecimal valor,
        BigDecimal taxaDeslocamento
) {
    public RecebimentoResponseDTO(Atendimento atendimento) {
        this(
                atendimento.getId(),
                atendimento.getDataPagamento(),
                atendimento.getAgendamento().getPaciente().getNome(),
                atendimento.getValor(),
                atendimento.getTaxaDeslocamento()
        );
    }
}
