package com.fisioUrsula.api.financeiro.despesas.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResumoFinanceiroResponseDTO(
        LocalDate inicio,
        LocalDate fim,
        BigDecimal faturamentoBruto,
        BigDecimal totalRecebido,
        BigDecimal totalPendente,
        BigDecimal totalDespesas,
        BigDecimal resultadoOperacional,
        long quantidadeAtendimentos,
        long quantidadePagos,
        long quantidadePendentes,
        long quantidadeAvaliacoes,
        long quantidadeAtendimentosNormais
) {
}
