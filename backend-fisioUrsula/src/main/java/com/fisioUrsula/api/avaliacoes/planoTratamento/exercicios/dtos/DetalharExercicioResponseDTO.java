package com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.dtos;

import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.Exercicio;
import com.fisioUrsula.api.shared.enums.TipoExercicio;

public record DetalharExercicioResponseDTO(
        Long id,
        String nome,
        TipoExercicio tipo,
        String descricao,
        boolean ativo) {

    public DetalharExercicioResponseDTO(Exercicio exercicio) {
        this(exercicio.getId(), exercicio.getNome(), exercicio.getTipoExercicio(),
                exercicio.getDescricao(), exercicio.isAtivo());
    }
}