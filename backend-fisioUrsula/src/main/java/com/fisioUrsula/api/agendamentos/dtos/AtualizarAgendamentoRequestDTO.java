
package com.fisioUrsula.api.agendamentos.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AtualizarAgendamentoRequestDTO(

        @NotNull
        @Positive
        Long pacienteId,

        @NotNull
        @FutureOrPresent
        LocalDate data,

        @NotNull
        LocalTime horaInicio,

        @NotNull
        LocalTime horaFim

) {
}
