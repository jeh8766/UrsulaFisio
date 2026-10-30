
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

    // REALIZAR ATENDIMENTO
    @Transactional
    public DetalharAtendimentoResponseDTO realizarAtendimento(
            Long agendamentoId,
            ConcluirAtendimentoRequestDTO dto
    ) {

        // 1. Busca o agendamento selecionado
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Agendamento não encontrado!"
                ));

        // 2. Verifica se é um agendamento de atendimento
        if (agendamento.getTipoAgendamento() != TipoAgendamento.ATENDIMENTO) {
            throw new IllegalStateException(
                    "Este agendamento não é do tipo atendimento!"
            );
        }

        // 3. Verifica se o agendamento está confirmado
        if (agendamento.getStatusAgendamento() != StatusAgendamento.CONFIRMADO) {
            throw new IllegalStateException(
                    "Só é possível realizar atendimentos de agendamentos confirmados!"
            );
        }

        // 4. Verifica se já existe um atendimento para esse agendamento
        if (atendimentoRepository.findByAgendamento_Id(agendamentoId).isPresent()) {
            throw new IllegalStateException(
                    "Este agendamento já possui um atendimento registrado!"
            );
        }

        // 5. Busca os sinais vitais pelo ID recebido
        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(dto.sinaisVitaisId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Registro de sinais vitais não encontrado!"
                ));

        // 6. Verifica se os sinais vitais já foram utilizados
        if (sinaisVitais.getAtendimento() != null) {
            throw new IllegalStateException(
                    "Estes sinais vitais já estão associados a outro atendimento!"
            );
        }

        // 7. Cria o atendimento
        Atendimento atendimento = new Atendimento();

        // Dados de data e horário vindos do agendamento
        atendimento.setData(agendamento.getData());
        atendimento.setHoraInicio(agendamento.getHoraInicio());
        atendimento.setHoraFim(agendamento.getHoraFim());

        // Associa o atendimento ao agendamento
        atendimento.setAgendamento(agendamento);

        // Associa os sinais vitais ao atendimento
        atendimento.setSinaisVitais(sinaisVitais);

        // Registro clínico do atendimento
        atendimento.setIntercorrencia(dto.intercorrencia());
        atendimento.setEvolucao(dto.evolucao());

        // Informações financeiras
        atendimento.setValor(dto.valor());
        atendimento.setTaxaDeslocamento(dto.taxaDeslocamento());

        // Situação do atendimento
        atendimento.setStatusAtendimento(StatusAtendimento.ATENDIDO);

        // Situação do pagamento
        atendimento.setStatusPagamento(StatusPagamento.PENDENTE);

        // Sincroniza o lado inverso do relacionamento
        sinaisVitais.setAtendimento(atendimento);

        // 8. Salva o atendimento
        Atendimento salvo = atendimentoRepository.save(atendimento);

        // 9. Retorna os dados do atendimento criado
        return new DetalharAtendimentoResponseDTO(salvo);
    }

    // DETALHAR ATENDIMENTO
    public DetalharAtendimentoResponseDTO detalharAtendimento(Long id) {

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Atendimento não encontrado!"
                ));

        return new DetalharAtendimentoResponseDTO(atendimento);
    }

    // REGISTRAR PAGAMENTO
    @Transactional
    public void registrarPagamento(Long id) {

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Atendimento não encontrado!"
                ));

        if (atendimento.getStatusPagamento() == StatusPagamento.PAGO) {
            throw new IllegalStateException("Atendimento já foi pago!");
        }

        if (atendimento.getStatusAtendimento() != StatusAtendimento.ATENDIDO) {
            throw new IllegalStateException(
                    "Não é possível registrar pagamento de um atendimento não realizado!"
            );
        }

        atendimento.setStatusPagamento(StatusPagamento.PAGO);

        atendimentoRepository.save(atendimento);
    }

    // LISTAR ATENDIMENTOS
    public List<ListarAtendimentosResponseDTO> listarAtendimentos() {

        return atendimentoRepository.findAll()
                .stream()
                .map(ListarAtendimentosResponseDTO::new)
                .toList();
    }

    // ATUALIZAR ATENDIMENTO
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

    // LISTAR ATENDIMENTOS POR PERÍODO
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
