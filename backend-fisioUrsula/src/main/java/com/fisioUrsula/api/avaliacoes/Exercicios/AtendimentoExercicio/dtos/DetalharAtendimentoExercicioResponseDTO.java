package com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.dtos;

import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.AtendimentoExercicio;

public record DetalharAtendimentoExercicioResponseDTO (

        Long id,
        Long atendimentoId,
        String nomeExercicio
) {
    public DetalharAtendimentoExercicioResponseDTO (AtendimentoExercicio atendimentoExercicio){

        this(
                atendimentoExercicio.getId(),
                atendimentoExercicio.getAtendimento().getId(),
                atendimentoExercicio.getExercicio().getNome()
        );
    }
}
