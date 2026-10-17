package com.fisioUrsula.api.agendamentos.dtos;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;

import jakarta.validation.constraints.NotNull;

public record AlterarStatusAgendamentoRequestDTO(@NotNull StatusAgendamento statusAgendamento) {

}
