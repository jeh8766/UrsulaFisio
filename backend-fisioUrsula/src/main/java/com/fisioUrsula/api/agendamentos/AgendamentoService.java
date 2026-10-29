
package com.fisioUrsula.api.agendamentos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.agendamentos.dtos.*;
import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.atendimentos.atendimento.AtendimentoRepository;
import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.avaliacao.AvaliacaoRepository;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.pacientes.paciente.dtos.PacienteResumoResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final PacienteRepository pacienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final AtendimentoRepository atendimentoRepository;


    public List<AgendamentoAgendaResponseDTO> listarPorPeriodo(
            LocalDate inicio,
            LocalDate fim
    ) {
        if (inicio == null || fim == null) {
            throw new IllegalArgumentException(
                    "A data inicial e a data final são obrigatórias."
            );
        }

        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException(
                    "A data inicial não pode ser posterior à data final."
            );
        }

        return agendamentoRepository
                .findByDataBetweenOrderByDataAscHoraInicioAsc(inicio, fim)
                .stream()
                .map(agendamento -> {
                    PacienteResumoResponseDTO pacienteDTO =
                            new PacienteResumoResponseDTO(
                                    agendamento.getPaciente()
                            );

                    return new AgendamentoAgendaResponseDTO(
                            agendamento.getId(),
                            pacienteDTO.id(),
                            pacienteDTO.nome(),
                            agendamento.getData(),
                            agendamento.getHoraInicio(),
                            agendamento.getHoraFim(),
                            agendamento.getTipoAgendamento(),
                            agendamento.getStatusAgendamento()
                    );
                })
                .toList();
    }

    public AgendamentoAgendaResponseDTO buscarPorId(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Agendamento não encontrado."
                ));

        PacienteResumoResponseDTO pacienteDTO =
                new PacienteResumoResponseDTO(agendamento.getPaciente());

        return new AgendamentoAgendaResponseDTO(
                agendamento.getId(),
                pacienteDTO.id(),
                pacienteDTO.nome(),
                agendamento.getData(),
                agendamento.getHoraInicio(),
                agendamento.getHoraFim(),
                agendamento.getTipoAgendamento(),
                agendamento.getStatusAgendamento()
        );
    }

    @Transactional
    public AgendarAvaliacaoResponseDTO AgendarAvaliacao(
            Long pacienteId,
            AgendarAvaliacaoRequestDTO dto
    ) {
        if (!dto.horaInicio().isBefore(dto.horaFim())) {
            throw new IllegalArgumentException(
                    "O horário de início deve ser anterior ao horário de fim."
            );
        }

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Paciente não encontrado."
                ));

        boolean existeConflito = agendamentoRepository.existeConflito(
                dto.data(),
                dto.horaInicio(),
                dto.horaFim(),
                List.of(StatusAgendamento.CANCELADO)
        );

        if (existeConflito) {
            throw new RegistroDuplicadoException(
                    "Já existe um agendamento nesse intervalo de horário."
            );
        }

        Agendamento agendamento = new Agendamento(dto, paciente);

        Agendamento agendamentoAvaliacaoSalvo =
                agendamentoRepository.save(agendamento);

        return new AgendarAvaliacaoResponseDTO(
                agendamentoAvaliacaoSalvo
        );
    }
    @Transactional
    public CriarAgendamentoAtendimentoResponseDTO criarAgendamentoAtendimento(
            Long pacienteId,
            CriarAgendamentoAtendimentoRequestDTO dto
    ) {
        if (!dto.horaInicio().isBefore(dto.horaFim())) {
            throw new IllegalArgumentException(
                    "O horário de início deve ser anterior ao horário de fim."
            );
        }

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Paciente não encontrado."
                ));

        boolean existeConflito = agendamentoRepository.existeConflito(
                dto.data(),
                dto.horaInicio(),
                dto.horaFim(),
                List.of(StatusAgendamento.CANCELADO)
        );

        if (existeConflito) {
            throw new RegistroDuplicadoException(
                    "Já existe um agendamento nesse intervalo de horário."
            );
        }

        Agendamento agendamento = new Agendamento();

        agendamento.setData(dto.data());
        agendamento.setHoraInicio(dto.horaInicio());
        agendamento.setHoraFim(dto.horaFim());
        agendamento.setTipoAgendamento(TipoAgendamento.ATENDIMENTO);
        agendamento.setStatusAgendamento(StatusAgendamento.PENDENTE);
        agendamento.setDataCancelamento(null);
        agendamento.setPaciente(paciente);

        Agendamento salvo = agendamentoRepository.save(agendamento);

        return new CriarAgendamentoAtendimentoResponseDTO(
                salvo.getId(),
                salvo.getData(),
                salvo.getHoraInicio(),
                salvo.getHoraFim(),
                salvo.getStatusAgendamento(),
                salvo.getTipoAgendamento(),
                new PacienteResumoResponseDTO(salvo.getPaciente())
        );
    }

    @Transactional
    public AgendamentoAgendaResponseDTO atualizarAgendamento(
            Long id,
            AtualizarAgendamentoRequestDTO dto
    ) {
        if (dto == null) {
            throw new IllegalArgumentException(
                    "Os dados para atualização são obrigatórios."
            );
        }

        if (dto.pacienteId() == null
                || dto.data() == null
                || dto.horaInicio() == null
                || dto.horaFim() == null) {
            throw new IllegalArgumentException(
                    "Paciente, data, hora de início e hora de fim são obrigatórios."
            );
        }

        if (!dto.horaInicio().isBefore(dto.horaFim())) {
            throw new IllegalArgumentException(
                    "O horário de início deve ser anterior ao horário de fim."
            );
        }

        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Agendamento não encontrado."
                ));

        if (agendamento.getStatusAgendamento()
                == StatusAgendamento.CANCELADO) {
            throw new IllegalStateException(
                    "Não é possível editar um agendamento cancelado."
            );
        }

        Paciente paciente = pacienteRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Paciente não encontrado."
                ));

        boolean existeConflito =
                agendamentoRepository.existeConflitoExcetoAgendamento(
                        dto.data(),
                        dto.horaInicio(),
                        dto.horaFim(),
                        List.of(StatusAgendamento.CANCELADO),
                        id
                );

        if (existeConflito) {
            throw new RegistroDuplicadoException(
                    "Já existe um agendamento nesse intervalo de horário."
            );
        }

        // Atualiza o paciente, a data e os horários.
        agendamento.setPaciente(paciente);
        agendamento.setData(dto.data());
        agendamento.setHoraInicio(dto.horaInicio());
        agendamento.setHoraFim(dto.horaFim());

        Agendamento atualizado = agendamentoRepository.save(agendamento);

        PacienteResumoResponseDTO pacienteDTO =
                new PacienteResumoResponseDTO(atualizado.getPaciente());

        return new AgendamentoAgendaResponseDTO(
                atualizado.getId(),
                pacienteDTO.id(),
                pacienteDTO.nome(),
                atualizado.getData(),
                atualizado.getHoraInicio(),
                atualizado.getHoraFim(),
                atualizado.getTipoAgendamento(),
                atualizado.getStatusAgendamento()
        );
    }


    @Transactional
    public void alterarStatusAgendamento(
            Long id,
            StatusAgendamento novoStatus
    ) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Agendamento não encontrado."
                ));

        agendamento.setStatusAgendamento(novoStatus);

        if (novoStatus == StatusAgendamento.CANCELADO) {
            agendamento.setDataCancelamento(LocalDate.now());
            return;
        }

        if (novoStatus != StatusAgendamento.CONFIRMADO) {
            return;
        }

        if (agendamento.getTipoAgendamento()
                == TipoAgendamento.AVALIACAO) {

            if (agendamento.getAvaliacao() != null) {
                throw new IllegalStateException(
                        "Este agendamento já possui uma avaliação associada."
                );
            }

            Avaliacao avaliacao = new Avaliacao();
            avaliacao.setAgendamento(agendamento);
            avaliacao.setStatusAtendimento(StatusAtendimento.AGENDADO);
            agendamento.setAvaliacao(avaliacao);

            avaliacaoRepository.save(avaliacao);
            return;
        }

        if (agendamento.getTipoAgendamento()
                == TipoAgendamento.ATENDIMENTO) {

            if (agendamento.getAtendimento() != null) {
                throw new IllegalStateException(
                        "Este agendamento já possui um atendimento associado."
                );
            }

            Atendimento atendimento = new Atendimento();
            atendimento.setAgendamento(agendamento);
            atendimento.setStatusAtendimento(StatusAtendimento.AGENDADO);
            agendamento.setAtendimento(atendimento);

            atendimentoRepository.save(atendimento);
        }
    }
}
