package com.fisioUrsula.api.agendamentos.agendamentos.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.agendamentos.agendamentos.enums.TipoAgendamento;
import com.fisioUrsula.api.pacientes.paciente.dtos.PacienteResumoResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;

public record CriarAgendamentoAtendimentoResponseDTO(
        Long id,
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        StatusAgendamento statusAgendamento,
        TipoAgendamento tipoAgendamento,
        PacienteResumoResponseDTO paciente

) {
}
