package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.time.LocalDate;
import java.util.List;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.agendamentos.AgendamentoRepository;
import com.fisioUrsula.api.avaliacoes.avaliacao.dto.*;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final PacienteRepository pacienteRepository;
    private final AgendamentoRepository agendamentoRepository;

    @Transactional
    public CriarAvaliacaoResponseDTO criarAvaliacao(CriarAvaliacaoRequestDTO dto) {

        Avaliacao avaliacao = new Avaliacao();

        avaliacao.setQueixaPrincipal(dto.queixaPrincipal());
        avaliacao.setStatusPagamento(StatusPagamento.PENDENTE);
        avaliacao.setStatusAtendimento(StatusAtendimento.AGENDADO);
        avaliacao.setObservacao(dto.observacao());
        avaliacao.setValor(dto.valor());

        Agendamento agendamento = agendamentoRepository.findById(dto.agendamentoId()).orElseThrow(() -> new RegistroNaoEncontradoException("Não existe agendamento com esse id!"));

        if (agendamento.getTipoAgendamento() != TipoAgendamento.AVALIACAO) {
            throw new IllegalStateException(
                    "O agendamento informado não é do tipo avaliação."
            );
        }

        if (avaliacaoRepository.existsByAgendamento_Id(agendamento.getId())) {
            throw new IllegalStateException("Esse agendamento ja possui uma avaliaçao registrada!");
        }

        if (agendamento.getStatusAgendamento() == StatusAgendamento.CANCELADO
                || agendamento.getStatusAgendamento() == StatusAgendamento.CONCLUIDO) {

            throw new IllegalStateException(
                    "Não é possível criar uma avaliação para um agendamento cancelado ou concluído."
            );
        }

        avaliacao.setAgendamento(agendamento);

        Avaliacao avaliacaoSalva = avaliacaoRepository.save(avaliacao);

        return new CriarAvaliacaoResponseDTO(avaliacaoSalva);
    }

    @Transactional
    public AtualizarAvaliacaoResponseDTO atualizarAvaliacao(Long id, AtualizarAvaliacaoRequestDTO dto) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Avaliação não encontrada."));

        if (dto.queixaPrincipal() != null) {
            avaliacao.setQueixaPrincipal(dto.queixaPrincipal());
        }

        if (dto.observacao() != null) {
            avaliacao.setObservacao(dto.observacao());
        }

        if (dto.valor() != null) {
            avaliacao.setValor(dto.valor());
        }

        Avaliacao avaliacaoSalva = avaliacaoRepository.save(avaliacao);
        return new AtualizarAvaliacaoResponseDTO(avaliacaoSalva);
    }

    public void RegistrarPagamento(Long id) {

        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Avaliação não encontrada."));

        if (avaliacao.getStatusPagamento() == StatusPagamento.PAGO) {
            throw new IllegalStateException("Essa avaliação ja esta paga!");
        }

        avaliacao.setStatusPagamento(StatusPagamento.PAGO);
        avaliacao.setDataPagamento(LocalDate.now());

        avaliacaoRepository.save(avaliacao);
    }

    @Transactional
    public void concluirAvaliacao(Long id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Avaliação não encontrada."));

        if (avaliacao.getStatusAtendimento() == StatusAtendimento.ATENDIDO) {
            throw new IllegalStateException("Não é possível alterar o status de uma avaliação já atendida.");
        }

        if (avaliacao.getAgendamento().getStatusAgendamento()
                != StatusAgendamento.CONFIRMADO) {

            throw new IllegalStateException(
                    "Não é possível concluir uma avaliação que não esteja confirmada."
            );
        }

        avaliacao.setStatusAtendimento(StatusAtendimento.ATENDIDO);
        avaliacao.getAgendamento().setStatusAgendamento(StatusAgendamento.CONCLUIDO);

        avaliacaoRepository.save(avaliacao);
    }

    @Transactional(readOnly = true)
    public List<ListarAvaliacoesResponseDTO> listarAvaliacoes() {
        return avaliacaoRepository.findAll().stream().map(ListarAvaliacoesResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ListarAvaliacoesResponseDTO buscarAvaliacaoPorId(Long id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Avaliação não encontrada."));

        return new ListarAvaliacoesResponseDTO(avaliacao);
    }

    @Transactional(readOnly = true)
    public List<ListarAvaliacoesResponseDTO> listarAvaliacoesDePaciente(Long pacienteId) {
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new RegistroNaoEncontradoException("Paciente não encontrado.");
        }
        return avaliacaoRepository.listarPorPaciente(pacienteId)
                .stream()
                .map(ListarAvaliacoesResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ListarAvaliacoesResponseDTO> listarAvaliacoesPorData(LocalDate data) {
        return avaliacaoRepository.listarPorData(data)
                .stream()
                .map(ListarAvaliacoesResponseDTO::new)
                .toList();
    }
}