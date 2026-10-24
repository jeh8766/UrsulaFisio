
        package com.fisioUrsula.api.agendamentos.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;

public record AgendamentoAgendaResponseDTO(
        Long id,
        Long pacienteId,
        String nome,
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        TipoAgendamento tipoAgendamento,
        StatusAgendamento statusAgendamento
) {}
