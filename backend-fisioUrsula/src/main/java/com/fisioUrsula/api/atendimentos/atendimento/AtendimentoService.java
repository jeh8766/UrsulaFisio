package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.*;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitaisRepository;
import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.agendamentos.AgendamentoRepository;
import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.AtendimentoExercicioService;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.DuplicateFormatFlagsException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AtendimentoService {

    private final AtendimentoRepository atendimentoRepository;
    private final SinaisVitaisRepository sinaisVitaisRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AtendimentoExercicioService atendimentoExercicioService;

    @Transactional
    public CriarAtendimentoResponseDTO criarAtendimento(CriarAtendimentoRequestDTO criarAtendimentoRequestDTO) {

        Atendimento atendimento = new Atendimento();

        atendimento.setValor(criarAtendimentoRequestDTO.valor());
        atendimento.setTaxaDeslocamento(criarAtendimentoRequestDTO.taxaDeslocamento());
        atendimento.setStatusAtendimento(StatusAtendimento.AGENDADO);
        atendimento.setStatusPagamento(StatusPagamento.PENDENTE);

        Agendamento agendamentoAtendimento = agendamentoRepository
                .findById(criarAtendimentoRequestDTO.agendamentoId())
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Id de agendamento não existe!"
                ));

        if (agendamentoAtendimento.getTipoAgendamento() != TipoAgendamento.ATENDIMENTO) {
            throw new IllegalStateException(
                    "O agendamento informado não é do tipo atendimento."
            );
        }

        if (atendimentoRepository.existsByAgendamento_Id(agendamentoAtendimento.getId())) {
            throw new IllegalStateException(
                    "Esse agendamento já possui um atendimento registrado!"
            );
        }

        atendimento.setAgendamento(agendamentoAtendimento);

        SinaisVitais sinaisVitais = sinaisVitaisRepository
                .findById(criarAtendimentoRequestDTO.sinaisVitaisId())
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Id de sinais vitais não existe!"
                ));

        atendimento.setSinaisVitais(sinaisVitais);

        Atendimento atendimentoSalvo = atendimentoRepository.save(atendimento);

        return new CriarAtendimentoResponseDTO(
                atendimentoSalvo.getId(),
                atendimentoSalvo.getIntercorrencia(),
                atendimentoSalvo.getEvolucao(),
                atendimentoSalvo.getValor(),
                atendimentoSalvo.getTaxaDeslocamento(),
                atendimentoSalvo.getStatusAtendimento(),
                atendimentoSalvo.getStatusPagamento()
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