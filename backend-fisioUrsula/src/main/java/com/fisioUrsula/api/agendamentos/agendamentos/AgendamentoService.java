package com.fisioUrsula.api.agendamentos.agendamentos;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.agendamentos.agendamentos.dtos.AgendarAvaliacaoRequestDTO;
import com.fisioUrsula.api.agendamentos.agendamentos.dtos.AgendarAvaliacaoResponseDTO;
import com.fisioUrsula.api.agendamentos.agendamentos.dtos.CriarAgendamentoAtendimentoRequestDTO;
import com.fisioUrsula.api.agendamentos.agendamentos.dtos.CriarAgendamentoAtendimentoResponseDTO;
import com.fisioUrsula.api.agendamentos.agendamentos.enums.TipoAgendamento;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.pacientes.paciente.dtos.PacienteResumoResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final PacienteRepository pacienteRepository;
    private final AgendamentoRepository agendamentoRepository;

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

        Agendamento agendamento = new Agendamento(dto, paciente);

        Agendamento agendamentoAvaliacaoSalvo = agendamentoRepository.save(agendamento);

        return new AgendarAvaliacaoResponseDTO(agendamentoAvaliacaoSalvo);
    }

    public CriarAgendamentoAtendimentoResponseDTO criarAgendamentoAtendimento(Long pacienteId,
            CriarAgendamentoAtendimentoRequestDTO criarAgendamentoAtendimentoRequestDTO) {

        Agendamento agendamento = new Agendamento();

        agendamento.setData(criarAgendamentoAtendimentoRequestDTO.data());
        agendamento.setHoraInicio(criarAgendamentoAtendimentoRequestDTO.horaInicio());
        agendamento.setHoraFim(criarAgendamentoAtendimentoRequestDTO.horaFim());
        agendamento.setTipoAgendamento(TipoAgendamento.ATENDIMENTO);

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Id de paciente não existe!"));
        agendamento.setPaciente(paciente);

        boolean existeConflito = agendamentoRepository.existeConflito(criarAgendamentoAtendimentoRequestDTO.data(),
                criarAgendamentoAtendimentoRequestDTO.horaInicio(), criarAgendamentoAtendimentoRequestDTO.horaFim(),
                StatusAgendamento.CANCELADO);

        if (existeConflito) {
            throw new RegistroDuplicadoException("Já existe um agendamento nesse intervalo de horário.");
        }

        agendamento.setStatusAgendamento(StatusAgendamento.PENDENTE);
        agendamento.setDataCancelamento(null);

        Agendamento agendamentoAtendimentoSalvo = agendamentoRepository.save(agendamento);

        System.out.println(agendamentoAtendimentoSalvo);

        CriarAgendamentoAtendimentoResponseDTO criarAgendamentoAtendimentoResponseDTO = new CriarAgendamentoAtendimentoResponseDTO(
                agendamentoAtendimentoSalvo.getId(),
                agendamentoAtendimentoSalvo.getData(),
                agendamentoAtendimentoSalvo.getHoraInicio(),
                agendamentoAtendimentoSalvo.getHoraFim(),
                agendamentoAtendimentoSalvo.getStatusAgendamento(),
                agendamentoAtendimentoSalvo.getTipoAgendamento(),
                new PacienteResumoResponseDTO(agendamentoAtendimentoSalvo.getPaciente()));

        return criarAgendamentoAtendimentoResponseDTO;
    }
}
