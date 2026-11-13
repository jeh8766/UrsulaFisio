package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import com.fisioUrsula.api.shared.enums.StatusPagamento;
import jakarta.validation.constraints.NotNull;

public record AlterarStatusPagamentoRequestDTO(
        @NotNull(message = "O status do pagamento é obrigatório")
        StatusPagamento statusPagamento
) {
}