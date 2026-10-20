package com.fisioUrsula.api.avaliacoes.avaliacao.dto;

import com.fisioUrsula.api.shared.enums.StatusAtendimento;

import jakarta.validation.constraints.NotNull;

public record AtualizarStatusAtendimentoAvaliacaoRequestDTO(

        @NotNull StatusAtendimento statusAtendimento) {
}
