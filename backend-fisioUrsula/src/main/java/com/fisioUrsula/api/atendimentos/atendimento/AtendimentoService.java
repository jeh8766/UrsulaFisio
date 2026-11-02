package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.*;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitaisRepository;
import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.agendamentos.AgendamentoRepository;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;
import java.time.LocalDate;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AtendimentoService {

    private final AtendimentoRepository atendimentoRepository;
    private final SinaisVitaisRepository sinaisVitaisRepository;
    private final AgendamentoRepository agendamentoRepository;

    @Transactional
    public DetalharAtendimentoResponseDTO realizarAtendimento(
            Long agendamentoId,
            ConcluirAtendimentoRequestDTO dto
    ) {

        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Agendamento não encontrado!"
                ));

        if (agendamento.getTipoAgendamento() != TipoAgendamento.ATENDIMENTO &&
                agendamento.getTipoAgendamento() != TipoAgendamento.AVALIACAO) {

            throw new IllegalStateException(
                    "Este agendamento não é do tipo atendimento ou avaliação!"
            );
        }

        if (agendamento.getStatusAgendamento() != StatusAgendamento.CONFIRMADO) {
            throw new IllegalStateException(
                    "Só é possível realizar atendimentos de agendamentos confirmados!"
            );
        }

        if (atendimentoRepository.findByAgendamento_Id(agendamentoId).isPresent()) {
            throw new IllegalStateException(
                    "Este agendamento já possui um atendimento registrado!"
            );
        }

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(dto.sinaisVitaisId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Registro de sinais vitais não encontrado!"
                ));

        if (sinaisVitais.getAtendimento() != null) {
            throw new IllegalStateException(
                    "Estes sinais vitais já estão associados a outro atendimento!"
            );
        }

        Atendimento atendimento = new Atendimento();

        atendimento.setData(agendamento.getData());
        atendimento.setHoraInicio(agendamento.getHoraInicio());
        atendimento.setHoraFim(agendamento.getHoraFim());
        atendimento.setAgendamento(agendamento);
        atendimento.setSinaisVitais(sinaisVitais);
        atendimento.setIntercorrencia(dto.intercorrencia());
        atendimento.setEvolucao(dto.evolucao());
        atendimento.setValor(dto.valor());
        atendimento.setTaxaDeslocamento(dto.taxaDeslocamento());
        atendimento.setStatusAtendimento(StatusAtendimento.ATENDIDO);
        atendimento.setStatusPagamento(StatusPagamento.PENDENTE);
        sinaisVitais.setAtendimento(atendimento);
        Atendimento salvo = atendimentoRepository.save(atendimento);
        agendamento.setStatusAgendamento(StatusAgendamento.CONCLUIDO);
        agendamentoRepository.save(agendamento);

        return new DetalharAtendimentoResponseDTO(salvo);
    }

    public DetalharAtendimentoResponseDTO detalharAtendimento(Long id) {

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Atendimento não encontrado!"
                ));

        return new DetalharAtendimentoResponseDTO(atendimento);
    }

    @Transactional
    public void atualizarStatusPagamento(
            Long id,
            StatusPagamento novoStatus
    ) {
        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Atendimento não encontrado."
                ));

        if (novoStatus == null) {
            throw new IllegalArgumentException(
                    "O status do pagamento é obrigatório."
            );
        }

        if (atendimento.getStatusAtendimento() != StatusAtendimento.ATENDIDO) {
            throw new IllegalStateException(
                    "Só é possível alterar o pagamento de um atendimento realizado."
            );
        }

        atendimento.setStatusPagamento(novoStatus);

        if (novoStatus == StatusPagamento.PAGO) {
            atendimento.setDataPagamento(LocalDate.now());
        } else {
            atendimento.setDataPagamento(null);
        }

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
            AtualizarAtendimentoRequestDTO dto
    ) {

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Atendimento não encontrado!"
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

        Atendimento atualizado = atendimentoRepository.save(atendimento);

        return new DetalharAtendimentoResponseDTO(atualizado);
    }

    // LISTAR ATENDIMENTOS DE UM PACIENTE
    public List<DetalharAtendimentoResponseDTO> listarAtendimentoPorPaciente(
            Long pacienteId
    ) {

        return atendimentoRepository
                .findByAgendamento_Paciente_IdOrderByAgendamento_DataDesc(pacienteId)
                .stream()
                .map(DetalharAtendimentoResponseDTO::new)
                .toList();
    }

    public List<DetalharAtendimentoResponseDTO> listarAtendimentosPorData(
            LocalDate dataInicio,
            LocalDate dataFim
    ) {

        if (dataInicio == null || dataFim == null) {
            throw new IllegalArgumentException(
                    "As datas de início e fim são obrigatórias!"
            );
        }

        if (dataInicio.isAfter(dataFim)) {
            throw new IllegalArgumentException(
                    "A data inicial não pode ser posterior à data final!"
            );
        }

        return atendimentoRepository
                .findByAgendamento_DataBetween(dataInicio, dataFim)
                .stream()
                .map(DetalharAtendimentoResponseDTO::new)
                .toList();
    }
}
