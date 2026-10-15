package com.fisioUrsula.api.agendamentos.agendamentoAtendimento;

import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.dtos.CriarAgendamentoAtendimentoRequestDTO;
import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.dtos.CriarAgendamentoAtendimentoResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.PacienteResumoResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AgendamentoAtendimentoService {

    public final AgendamentoAtendimentoRepository agendamentoAtendimentoRepository;
    public final PacienteRepository pacienteRepository;
    //public final PlanoTratamentoRepository;


    public CriarAgendamentoAtendimentoResponseDTO criarAgendamentoAtendimento(CriarAgendamentoAtendimentoRequestDTO criarAgendamentoAtendimentoRequestDTO){

        AgendamentoAtendimento agendamentoAtendimento = new AgendamentoAtendimento();

        agendamentoAtendimento.setData(criarAgendamentoAtendimentoRequestDTO.data());
        agendamentoAtendimento.setHoraInicio(criarAgendamentoAtendimentoRequestDTO.horaInicio());
        agendamentoAtendimento.setHoraFim(criarAgendamentoAtendimentoRequestDTO.horaFim());

        Paciente paciente = pacienteRepository.findById(criarAgendamentoAtendimentoRequestDTO.pacienteId()).orElseThrow(() -> new RuntimeException("Id de paciente não existe!"));
        agendamentoAtendimento.setPaciente(paciente);

        agendamentoAtendimento.setStatusAgendamento(StatusAgendamento.PENDENTE);
        agendamentoAtendimento.setDataCancelamento(null);

        AgendamentoAtendimento agendamentoAtendimentoSalvo = agendamentoAtendimentoRepository.save(agendamentoAtendimento);

        CriarAgendamentoAtendimentoResponseDTO criarAgendamentoAtendimentoResponseDTO = new CriarAgendamentoAtendimentoResponseDTO(
                agendamentoAtendimentoSalvo.getId(),
                agendamentoAtendimentoSalvo.getData(),
                agendamentoAtendimentoSalvo.getHoraInicio(),
                agendamentoAtendimentoSalvo.getHoraFim(),
                agendamentoAtendimentoSalvo.getStatusAgendamento(),
                new PacienteResumoResponseDTO(agendamentoAtendimentoSalvo.getPaciente())
        );

        return criarAgendamentoAtendimentoResponseDTO;
    }
}
