package com.fisioUrsula.api.agendamentos.agendamentoAtendimento.dtos;

import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.PacienteResumoResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;

import java.time.LocalDate;
import java.time.LocalTime;

public record CriarAgendamentoAtendimentoResponseDTO(
        Long id,
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        StatusAgendamento statusAgendamento,
        PacienteResumoResponseDTO paciente

) {
}
