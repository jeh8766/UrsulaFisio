package com.fisioUrsula.api.agendamentos.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

public record AgendarAvaliacaoRequestDTO(
        @NotNull @FutureOrPresent LocalDate data,

        @NotNull LocalTime horaInicio,

        @NotNull LocalTime horaFim) {

}
