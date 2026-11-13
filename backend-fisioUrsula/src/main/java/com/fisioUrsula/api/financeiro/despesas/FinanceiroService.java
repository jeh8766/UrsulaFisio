package com.fisioUrsula.api.financeiro.despesas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fisioUrsula.api.financeiro.despesas.dtos.ResumoFinanceiroResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.atendimentos.atendimento.AtendimentoRepository;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final AtendimentoRepository atendimentoRepository;
    private final DespesaRepository despesaRepository;

    @Transactional(readOnly = true)
    public ResumoFinanceiroResponseDTO obterResumo(
            LocalDate inicio,
            LocalDate fim
    ) {
        validarPeriodo(inicio, fim);

        List<Atendimento> atendimentos =
                atendimentoRepository.findByAgendamento_DataBetween(inicio, fim);

        BigDecimal faturamentoBruto = BigDecimal.ZERO;
        BigDecimal totalRecebido = BigDecimal.ZERO;
        BigDecimal totalPendente = BigDecimal.ZERO;

        long quantidadePagos = 0;
        long quantidadePendentes = 0;
        long quantidadeAvaliacoes = 0;
        long quantidadeAtendimentosNormais = 0;

        for (Atendimento atendimento : atendimentos) {

            BigDecimal valor = atendimento.getValor() != null
                    ? atendimento.getValor()
                    : BigDecimal.ZERO;

            BigDecimal deslocamento = atendimento.getTaxaDeslocamento() != null
                    ? atendimento.getTaxaDeslocamento()
                    : BigDecimal.ZERO;

            BigDecimal valorTotal = valor.add(deslocamento);

            faturamentoBruto = faturamentoBruto.add(valorTotal);

            if (atendimento.getStatusPagamento() == StatusPagamento.PAGO) {
                quantidadePagos++;
            } else {
                totalPendente = totalPendente.add(valorTotal);
                quantidadePendentes++;
            }

            if (atendimento.getAgendamento().getTipoAgendamento()
                    == TipoAgendamento.AVALIACAO) {
                quantidadeAvaliacoes++;
            } else {
                quantidadeAtendimentosNormais++;
            }
        }
        List<Atendimento> recebimentos =
                atendimentoRepository.findByDataPagamentoBetween(inicio, fim);

        for (Atendimento atendimento : recebimentos) {

            BigDecimal valor = atendimento.getValor() != null
                    ? atendimento.getValor()
                    : BigDecimal.ZERO;

            BigDecimal deslocamento = atendimento.getTaxaDeslocamento() != null
                    ? atendimento.getTaxaDeslocamento()
                    : BigDecimal.ZERO;

            totalRecebido = totalRecebido.add(valor).add(deslocamento);
        }

        BigDecimal totalDespesas =
                despesaRepository.somarValores(null, inicio, fim);

        if (totalDespesas == null) {
            totalDespesas = BigDecimal.ZERO;
        }

        BigDecimal resultadoOperacional =
                faturamentoBruto.subtract(totalDespesas);

        return new ResumoFinanceiroResponseDTO(
                inicio,
                fim,
                faturamentoBruto,
                totalRecebido,
                totalPendente,
                totalDespesas,
                resultadoOperacional,
                atendimentos.size(),
                quantidadePagos,
                quantidadePendentes,
                quantidadeAvaliacoes,
                quantidadeAtendimentosNormais
        );
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
