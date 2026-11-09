package com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.dtos;

import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.AtendimentoExercicio;

public record AtribuirAtendimentoExercicioResponseDTO(

        Long id,
        Long atendimentoID,
        Long exercicioId
) {
    public AtribuirAtendimentoExercicioResponseDTO (AtendimentoExercicio atendimentoExercicio){
        this(
                atendimentoExercicio.getId(),
                atendimentoExercicio.getAtendimento().getId(),
                atendimentoExercicio.getExercicio().getId()
        );
    }
}
