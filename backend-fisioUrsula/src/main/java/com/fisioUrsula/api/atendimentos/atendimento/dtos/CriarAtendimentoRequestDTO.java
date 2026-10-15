package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CriarAtendimentoRequestDTO(

        @NotNull
        LocalDate data,
        @NotNull
        LocalTime horaInicio,
        @NotNull
        LocalTime horaFim,
        @NotNull
        Double valor,
        @NotNull
        Double taxaDeslocamento,
        Long agendamentoAtendimentoId,
        Long sinaisVitaisId

){
}
