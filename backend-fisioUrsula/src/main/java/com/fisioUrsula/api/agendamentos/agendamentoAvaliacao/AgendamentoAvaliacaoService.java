package com.fisioUrsula.api.agendamentos.agendamentoAvaliacao;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.dtos.AgendarAvaliacaoRequestDTO;
import com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.dtos.AgendarAvaliacaoResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgendamentoAvaliacaoService {

    private final PacienteRepository pacienteRepository;
    private final AgendamentoAvaliacaoRepository agendamentoRepository;

    @Transactional
    public AgendarAvaliacaoResponseDTO AgendarAvaliacao(Long pacienteId, AgendarAvaliacaoRequestDTO dto) {

        if (!dto.horaInicio().isBefore(dto.horaFim())) {
            throw new IllegalArgumentException("O horário de início deve ser anterior ao horário de fim.");
        }

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new EntityNotFoundException("Paciente não encontrado."));

        boolean existeConflito = agendamentoRepository.existeConflito(dto.data(), dto.horaInicio(), dto.horaFim(),
                StatusAgendamento.CANCELADO);

        if (existeConflito) {
            throw new RegistroDuplicadoException("Já existe um agendamento nesse intervalo de horário.");
        }

        AgendamentoAvaliacao agendamento = new AgendamentoAvaliacao(dto, paciente);

        AgendamentoAvaliacao agendamentoAvaliacaoSalvo = agendamentoRepository.save(agendamento);

        return new AgendarAvaliacaoResponseDTO(agendamentoAvaliacaoSalvo);
    }
}
