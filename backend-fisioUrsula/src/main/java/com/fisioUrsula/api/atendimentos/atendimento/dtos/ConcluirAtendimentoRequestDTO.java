
package com.fisioUrsula.api.atendimentos.atendimento.dtos;

import java.util.List;

public record ConcluirAtendimentoRequestDTO(

        String intercorrencia,
        String evolucao,
        List<Long> exerciciosIds
) {}

