package com.fisioUrsula.api.agendamentos.agendamentoAtendimento.dtos;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CriarAgendamentoAtendimentoRequestDTO(

        @NotNull
        LocalDate data,
        @NotNull
        LocalTime horaInicio,
        @NotNull
        LocalTime horaFim,
        @NotNull
        Long pacienteId
        //PlanoTratamento planoTratamento
) {
}
