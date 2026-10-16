package com.fisioUrsula.api.agendamentos.agendamentos.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.agendamentos.agendamentos.Agendamento;
import com.fisioUrsula.api.agendamentos.agendamentos.enums.TipoAgendamento;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;

public record AgendarAvaliacaoResponseDTO(
        Long id,
        Long pacienteId,
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        StatusAgendamento statusAgendamento, TipoAgendamento tipoAgendamento) {

    public AgendarAvaliacaoResponseDTO(Agendamento dto) {
        this(
                dto.getId(),
                dto.getPaciente().getId(),
                dto.getData(),
                dto.getHoraInicio(),
                dto.getHoraFim(),
                dto.getStatusAgendamento(),
                dto.getTipoAgendamento());
    }
}
