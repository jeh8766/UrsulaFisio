package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record CriarAtendimentoResponseDTO(
        Long id,

        LocalDate data,

        LocalTime horaInicio,

        LocalTime horaFim,

        String intercorrencia,

        String evolucao,

        Double valor,

        Double taxaDeslocamento,

        StatusAgendamento statusAgendamento,

        StatusPagamento statusPagamento
) {
}
