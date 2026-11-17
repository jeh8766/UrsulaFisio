
package com.fisioUrsula.api.financeiro.despesas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fisioUrsula.api.financeiro.despesas.dtos.RecebimentoResponseDTO;
import com.fisioUrsula.api.financeiro.despesas.dtos.ResumoFinanceiroResponseDTO;
import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.atendimentos.atendimento.AtendimentoRepository;
import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.avaliacao.AvaliacaoRepository;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final AtendimentoRepository atendimentoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final DespesaRepository despesaRepository;

    @Transactional(readOnly = true)
    public ResumoFinanceiroResponseDTO obterResumo(
            LocalDate inicio,
            LocalDate fim
    ) {

        validarPeriodo(inicio, fim);

        List<Atendimento> atendimentosRealizados =
                atendimentoRepository.findByAgendamento_DataBetween(inicio, fim)
                        .stream()
                        .filter(this::atendimentoFoiRealizado)
                        .toList();

        List<Avaliacao> avaliacoesRealizadas =
                avaliacaoRepository.findByAgendamento_DataBetween(inicio, fim)
                        .stream()
                        .filter(this::avaliacaoFoiRealizada)
                        .toList();

        BigDecimal faturamentoAtendimentos = atendimentosRealizados.stream()
                .map(this::calcularValorAtendimento)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal faturamentoAvaliacoes = avaliacoesRealizadas.stream()
                .map(avaliacao -> valorOuZero(avaliacao.getValor()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal faturamentoBruto =
                faturamentoAtendimentos.add(faturamentoAvaliacoes);

        List<Atendimento> atendimentosPendentes = atendimentosRealizados.stream()
                .filter(a -> a.getStatusPagamento() == StatusPagamento.PENDENTE)
                .toList();

        List<Avaliacao> avaliacoesPendentes = avaliacoesRealizadas.stream()
                .filter(a -> a.getStatusPagamento() == StatusPagamento.PENDENTE)
                .toList();

        BigDecimal totalPendenteAtendimentos = atendimentosPendentes.stream()
                .map(this::calcularValorAtendimento)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPendenteAvaliacoes = avaliacoesPendentes.stream()
                .map(avaliacao -> valorOuZero(avaliacao.getValor()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPendente =
                totalPendenteAtendimentos.add(totalPendenteAvaliacoes);

        long quantidadePendentes =
                atendimentosPendentes.size() + avaliacoesPendentes.size();

        List<Atendimento> pagamentosAtendimentos =
                atendimentoRepository.findByDataPagamentoBetweenAndStatusPagamento(
                        inicio,
                        fim,
                        StatusPagamento.PAGO
                );

        List<Avaliacao> pagamentosAvaliacoes =
                avaliacaoRepository.findByDataPagamentoBetweenAndStatusPagamento(
                        inicio,
                        fim,
                        StatusPagamento.PAGO
                );

        BigDecimal recebidoAtendimentos = pagamentosAtendimentos.stream()
                .map(this::calcularValorAtendimento)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal recebidoAvaliacoes = pagamentosAvaliacoes.stream()
                .map(avaliacao -> valorOuZero(avaliacao.getValor()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRecebido =
                recebidoAtendimentos.add(recebidoAvaliacoes);

        long quantidadePagos =
                pagamentosAtendimentos.size() + pagamentosAvaliacoes.size();

        BigDecimal totalDespesas =
                despesaRepository.somarValores(null, inicio, fim);

        if (totalDespesas == null) {
            totalDespesas = BigDecimal.ZERO;
        }

        BigDecimal resultadoOperacional =
                totalRecebido.subtract(faturamentoBruto);

        long quantidadeAtendimentosNormais = atendimentosRealizados.size();
        long quantidadeAvaliacoes = avaliacoesRealizadas.size();

        long quantidadeAtendimentos =
                quantidadeAtendimentosNormais + quantidadeAvaliacoes;

        return new ResumoFinanceiroResponseDTO(
                inicio,
                fim,
                faturamentoBruto,
                totalRecebido,
                totalPendente,
                totalDespesas,
                resultadoOperacional,
                quantidadeAtendimentos,
                quantidadePagos,
                quantidadePendentes,
                quantidadeAvaliacoes,
                quantidadeAtendimentosNormais
        );
    }

    @Transactional(readOnly = true)
    public List<RecebimentoResponseDTO> listarRecebimentos(
            LocalDate inicio,
            LocalDate fim
    ) {
        validarPeriodo(inicio, fim);

        return atendimentoRepository
                .findByDataPagamentoBetween(inicio, fim)
                .stream()
                .filter(a -> a.getStatusPagamento() == StatusPagamento.PAGO)
                .map(RecebimentoResponseDTO::new)
                .toList();
    }

    private boolean atendimentoFoiRealizado(Atendimento atendimento) {

        return atendimento.getStatusAtendimento() == StatusAtendimento.ATENDIDO
                && atendimento.getAgendamento().getStatusAgendamento()
                == StatusAgendamento.CONCLUIDO;
    }

    private boolean avaliacaoFoiRealizada(Avaliacao avaliacao) {

        return avaliacao.getStatusAtendimento() == StatusAtendimento.ATENDIDO
                && avaliacao.getAgendamento().getStatusAgendamento()
                == StatusAgendamento.CONCLUIDO;
    }

    private BigDecimal calcularValorAtendimento(Atendimento atendimento) {

        BigDecimal valor = valorOuZero(atendimento.getValor());
        BigDecimal deslocamento = valorOuZero(atendimento.getTaxaDeslocamento());

        return valor.add(deslocamento);
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {

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
    }
}
