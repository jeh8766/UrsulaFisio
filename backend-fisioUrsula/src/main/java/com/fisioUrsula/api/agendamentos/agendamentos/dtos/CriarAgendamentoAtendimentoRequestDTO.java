package com.fisioUrsula.api.agendamentos.agendamentos.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public record CriarAgendamentoAtendimentoRequestDTO(

                @NotNull LocalDate data,
                @NotNull LocalTime horaInicio,
                @NotNull LocalTime horaFim
// PlanoTratamento planoTratamento
) {
}
