
package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.*;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitaisRepository;
import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.agendamentos.AgendamentoRepository;
import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.AtendimentoExercicioService;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AtendimentoService {

    private final AtendimentoRepository atendimentoRepository;
    private final SinaisVitaisRepository sinaisVitaisRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AtendimentoExercicioService atendimentoExercicioService;

    @Transactional
    public CriarAtendimentoResponseDTO criarAtendimento(
            CriarAtendimentoRequestDTO dto
    ) {

        Agendamento agendamento = agendamentoRepository
                .findById(dto.agendamentoId())
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Id de agendamento não existe!"
                ));

        if (agendamento.getStatusAgendamento() == StatusAgendamento.CANCELADO
                || agendamento.getStatusAgendamento() == StatusAgendamento.CONCLUIDO) {
            throw new IllegalStateException(
                    "Não é possível criar um atendimento para um agendamento cancelado ou concluído!"
            );
        }

        if (agendamento.getTipoAgendamento() != TipoAgendamento.ATENDIMENTO) {
            throw new IllegalStateException(
                    "O agendamento informado não é do tipo atendimento."
            );
        }

        if (agendamento.getStatusAgendamento() != StatusAgendamento.CONFIRMADO) {
            throw new IllegalStateException(
                    "Somente agendamentos confirmados podem gerar atendimentos."
            );
        }

        if (atendimentoRepository.existsByAgendamento_Id(agendamento.getId())) {
            throw new RegistroDuplicadoException(
                    "Esse agendamento já possui um atendimento registrado!"
            );
        }

        Atendimento atendimento = new Atendimento();

        atendimento.setAgendamento(agendamento);
        atendimento.setValor(dto.valor());
        atendimento.setTaxaDeslocamento(dto.taxaDeslocamento());
        atendimento.setStatusAtendimento(StatusAtendimento.AGENDADO);
        atendimento.setStatusPagamento(StatusPagamento.PENDENTE);

        Atendimento salvo = atendimentoRepository.save(atendimento);

        return new CriarAtendimentoResponseDTO(
                salvo.getId(),
                salvo.getIntercorrencia(),
                salvo.getEvolucao(),
                salvo.getValor(),
                salvo.getTaxaDeslocamento(),
                salvo.getStatusAtendimento(),
                salvo.getStatusPagamento()
        );
    }

    public DetalharAtendimentoResponseDTO detalharAtendimento(Long id) {

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Atendimento com o Id não existe!"
                ));

        return new DetalharAtendimentoResponseDTO(atendimento);
    }

    @Transactional
    public DetalharAtendimentoResponseDTO concluirAtendimento(
            Long atendimentoId,
            ConcluirAtendimentoRequestDTO dto) {

        Atendimento atendimento = atendimentoRepository.findById(atendimentoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Atendimento com esse id não existe!"
                ));

        if (atendimento.getStatusAtendimento() == StatusAtendimento.ATENDIDO) {
            throw new IllegalStateException("Esse atendimento já foi realizado!");
        }

        if (atendimento.getAgendamento().getStatusAgendamento()
                != StatusAgendamento.CONFIRMADO) {
            throw new IllegalStateException(
                    "Não se pode concluir um atendimento que não esteja confirmado!"
            );
        }

        atendimentoExercicioService.atribuirVariosExercicios(
                atendimentoId,
                dto.exerciciosIds()
        );

        atendimento.setIntercorrencia(dto.intercorrencia());
        atendimento.setEvolucao(dto.evolucao());

        atendimento.setStatusAtendimento(StatusAtendimento.ATENDIDO);
        atendimento.getAgendamento().setStatusAgendamento(StatusAgendamento.CONCLUIDO);

        Atendimento atendimentoSalvo = atendimentoRepository.save(atendimento);

        return new DetalharAtendimentoResponseDTO(atendimentoSalvo);
    }

    @Transactional
    public void registrarPagamento(Long id) {

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Atendimento com esse id não existe!"
                ));

        if (atendimento.getStatusPagamento() == StatusPagamento.PAGO) {
            throw new IllegalStateException("Atendimento já foi pago!");
        }

        atendimento.setStatusPagamento(StatusPagamento.PAGO);
        atendimento.setDataPagamento(LocalDate.now());

        atendimentoRepository.save(atendimento);
    }

    public List<ListarAtendimentosResponseDTO> listarAtendimentos() {
        return atendimentoRepository.findAll()
                .stream()
                .map(ListarAtendimentosResponseDTO::new)
                .toList();
    }

    @Transactional
    public DetalharAtendimentoResponseDTO atualizarAtendimento(
            Long id,
            AtualizarAtendimentoRequestDTO dto) {

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Atendimento com esse id não existe!"
                ));

        if (dto.intercorrencia() != null) {
            atendimento.setIntercorrencia(dto.intercorrencia());
        }

        if (dto.evolucao() != null) {
            atendimento.setEvolucao(dto.evolucao());
        }

        if (dto.valor() != null) {
            atendimento.setValor(dto.valor());
        }

        if (dto.taxaDeslocamento() != null) {
            atendimento.setTaxaDeslocamento(dto.taxaDeslocamento());
        }

        atendimentoRepository.save(atendimento);

        return new DetalharAtendimentoResponseDTO(atendimento);
    }

    public List<DetalharAtendimentoResponseDTO> listarAtendimentoPorPaciente(
            Long pacienteId) {

        return atendimentoRepository
                .findByAgendamento_Paciente_IdOrderByAgendamento_DataDesc(pacienteId)
                .stream()
                .map(DetalharAtendimentoResponseDTO::new)
                .toList();
    }

    public List<DetalharAtendimentoResponseDTO> listarAtendimentosPorData(
            LocalDate dataInicio,
            LocalDate dataFim) {

        if (dataInicio == null || dataFim == null) {
            throw new IllegalArgumentException(
                    "A data de início e a data final são obrigatórias!"
            );
        }

        if (dataInicio.isAfter(dataFim)) {
            throw new IllegalArgumentException(
                    "Data de início não pode ser depois da data final!"
            );
        }

        return atendimentoRepository
                .findByAgendamento_DataBetween(dataInicio, dataFim)
                .stream()
                .map(DetalharAtendimentoResponseDTO::new)
                .toList();
    }
}
