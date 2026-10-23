package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record DetalharAtendimentoResponseDTO(
        Long id,

        LocalDate data,

        LocalTime horaInicio,

        LocalTime horaFim,

        String intercorrencia,

        String evolucao,

        BigDecimal valor,

        BigDecimal taxaDeslocamento,

        StatusAtendimento statusAtendimento,

        StatusPagamento statusPagamento,

        Long pacienteId,
        String pacienteNome,

        Long sinaisVitaisId
) {
    public DetalharAtendimentoResponseDTO(Atendimento atendimento) {
        this(
                atendimento.getId(),
                atendimento.getAgendamento().getData(),
                atendimento.getAgendamento().getHoraInicio(),
                atendimento.getAgendamento().getHoraFim(),

                atendimento.getIntercorrencia(),
                atendimento.getEvolucao(),

                atendimento.getValor(),
                atendimento.getTaxaDeslocamento(),

                atendimento.getStatusAtendimento(),
                atendimento.getStatusPagamento(),

                atendimento.getAgendamento()
                        .getPaciente()
                        .getId(),

                atendimento.getAgendamento()
                        .getPaciente()
                        .getNome(),

                atendimento.getSinaisVitais().getId()
        );
    }
}
