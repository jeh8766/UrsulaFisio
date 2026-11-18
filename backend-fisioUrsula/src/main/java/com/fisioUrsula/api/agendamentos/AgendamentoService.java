
package com.fisioUrsula.api.agendamentos;

import java.time.LocalDate;
import java.util.List;

import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import org.springframework.stereotype.Service;

import com.fisioUrsula.api.agendamentos.dtos.*;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.pacientes.paciente.dtos.PacienteResumoResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final PacienteRepository pacienteRepository;
    private final AgendamentoRepository agendamentoRepository;

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
                .map(this::converterParaAgenda)
                .toList();
    }

    public AgendamentoAgendaResponseDTO buscarPorId(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Agendamento não encontrado."
                ));

        return converterParaAgenda(agendamento);
    }

    private AgendamentoAgendaResponseDTO converterParaAgenda(
            Agendamento agendamento
    ) {
        PacienteResumoResponseDTO pacienteDTO =
                new PacienteResumoResponseDTO(agendamento.getPaciente());

        Long atendimentoId = agendamento.getAtendimento() != null
                ? agendamento.getAtendimento().getId()
                : null;

        Long avaliacaoId = agendamento.getAvaliacao() != null
                ? agendamento.getAvaliacao().getId()
                : null;

        return new AgendamentoAgendaResponseDTO(
                agendamento.getId(),
                pacienteDTO.id(),
                pacienteDTO.nome(),
                agendamento.getData(),
                agendamento.getHoraInicio(),
                agendamento.getHoraFim(),
                agendamento.getTipoAgendamento(),
                agendamento.getStatusAgendamento(),
                atendimentoId,
                avaliacaoId
        );
    }

    @Transactional
    public AgendarAvaliacaoResponseDTO criarAgendamentoAvaliacao(
            Long pacienteId,
            AgendarAvaliacaoRequestDTO dto
    ) {
        if (!dto.horaInicio().isBefore(dto.horaFim())) {
            throw new IllegalArgumentException(
                    "O horário de início deve ser anterior ao horário de fim."
            );
        }

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Paciente não encontrado."
                ));

        if (!paciente.isAtivo()) {
            throw new IllegalStateException(
                    "Não é possível agendar para um paciente inativo."
            );
        }

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
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Paciente não encontrado."
                ));

        if (!paciente.isAtivo()) {
            throw new IllegalStateException(
                    "Não é possível agendar para um paciente inativo."
            );
        }

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
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Agendamento não encontrado."
                ));

        if (agendamento.getStatusAgendamento() == StatusAgendamento.CANCELADO
                || agendamento.getStatusAgendamento() == StatusAgendamento.CONCLUIDO) {
            throw new IllegalStateException(
                    "Não é possível editar um agendamento cancelado ou concluído."
            );
        }

        Paciente paciente = pacienteRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Paciente não encontrado."
                ));

        if (!paciente.isAtivo()) {
            throw new IllegalStateException(
                    "Não é possível agendar para um paciente inativo."
            );
        }

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

        agendamento.setPaciente(paciente);
        agendamento.setData(dto.data());
        agendamento.setHoraInicio(dto.horaInicio());
        agendamento.setHoraFim(dto.horaFim());

        Agendamento atualizado = agendamentoRepository.save(agendamento);

        return converterParaAgenda(atualizado);
    }

    @Transactional
    public void alterarStatusAgendamento(
            Long id,
            StatusAgendamento novoStatus
    ) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Agendamento não encontrado."
                ));

        if (novoStatus == null) {
            throw new IllegalArgumentException(
                    "O novo status do agendamento é obrigatório."
            );
        }

        StatusAgendamento statusAtual = agendamento.getStatusAgendamento();

        if (statusAtual == StatusAgendamento.CONCLUIDO
                || statusAtual == StatusAgendamento.CANCELADO) {
            throw new IllegalStateException(
                    "Não é possível alterar um agendamento cancelado ou concluído."
            );
        }

        if (novoStatus == StatusAgendamento.CONCLUIDO) {
            throw new IllegalStateException(
                    "O agendamento só pode ser concluído pela realização do atendimento ou avaliação."
            );
        }

        if (statusAtual == StatusAgendamento.PENDENTE
                && novoStatus != StatusAgendamento.CONFIRMADO
                && novoStatus != StatusAgendamento.CANCELADO) {
            throw new IllegalStateException(
                    "Um agendamento pendente só pode ser confirmado ou cancelado."
            );
        }

        if (statusAtual == StatusAgendamento.CONFIRMADO
                && novoStatus != StatusAgendamento.CANCELADO) {
            throw new IllegalStateException(
                    "Um agendamento confirmado só pode ser cancelado."
            );
        }

        agendamento.setStatusAgendamento(novoStatus);

        if (novoStatus == StatusAgendamento.CANCELADO) {

            agendamento.setDataCancelamento(LocalDate.now());

            if (agendamento.getAtendimento() != null) {
                agendamento.getAtendimento()
                        .setStatusAtendimento(StatusAtendimento.CANCELADO);
            }

            if (agendamento.getAvaliacao() != null) {
                agendamento.getAvaliacao()
                        .setStatusAtendimento(StatusAtendimento.CANCELADO);
            }

        } else {
            agendamento.setDataCancelamento(null);
        }
    }
}
