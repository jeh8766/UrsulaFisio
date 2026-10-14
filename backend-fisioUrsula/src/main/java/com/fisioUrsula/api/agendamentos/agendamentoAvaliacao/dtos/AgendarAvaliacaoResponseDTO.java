package com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.AgendamentoAvaliacao;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;

public record AgendarAvaliacaoResponseDTO(
        Long id,
        Long pacienteId,
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        StatusAgendamento statusAgendamento) {

    public AgendarAvaliacaoResponseDTO(AgendamentoAvaliacao dto) {
        this(
                dto.getId(),
                dto.getPaciente().getId(),
                dto.getData(),
                dto.getHoraInicio(),
                dto.getHoraFim(),
                dto.getStatusAgendamento());
    }
}
