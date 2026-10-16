package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import java.time.LocalDate;
import java.time.LocalTime;

public record DetalharAtendimentoResponseDTO(
        Long id,

        LocalDate data,

        LocalTime horaInicio,

        LocalTime horaFim,

        String intercorrencia,

        String evolucao,

        Double valor,

        Double taxaDeslocamento,

        StatusAgendamento statusAgendamento,

        StatusPagamento statusPagamento,

        Long pacienteId,
        String pacienteNome,

        Long sinaisVitaisId
) {
    public DetalharAtendimentoResponseDTO(Atendimento atendimento) {
        this(
                atendimento.getId(),
                atendimento.getData(),
                atendimento.getHoraInicio(),
                atendimento.getHoraFim(),

                atendimento.getIntercorrencia(),
                atendimento.getEvolucao(),

                atendimento.getValor(),
                atendimento.getTaxaDeslocamento(),

                atendimento.getStatusAgendamento(),
                atendimento.getStatusPagamento(),

                atendimento.getAgendamentoAtendimento()
                        .getPaciente()
                        .getId(),

                atendimento.getAgendamentoAtendimento()
                        .getPaciente()
                        .getNome(),

                atendimento.getSinaisVitais().getId()
        );
    }
}
