package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import jakarta.validation.constraints.NotNull;

public record ConcluirAtendimentoRequestDTO(

        String intercorrencia,
        @NotNull
        String evolucao
) {



}
