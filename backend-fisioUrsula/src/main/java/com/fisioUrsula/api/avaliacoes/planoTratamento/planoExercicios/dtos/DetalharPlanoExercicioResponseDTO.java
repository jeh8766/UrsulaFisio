package com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos;

import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.PlanoExercicio;
import com.fisioUrsula.api.shared.enums.TipoExercicio;

public record DetalharPlanoExercicioResponseDTO(
        Long id,
        String observacao,
        Long exercicioId,
        String exercicioNome,
        TipoExercicio exercicioTipo,
        String exercicioDescricao) {

    public DetalharPlanoExercicioResponseDTO(PlanoExercicio planoExercicio) {
        this(planoExercicio.getId(),
                planoExercicio.getObservacao(),
                planoExercicio.getExercicio().getId(),
                planoExercicio.getExercicio().getNome(),
                planoExercicio.getExercicio().getTipoExercicio(),
                planoExercicio.getExercicio().getDescricao());
    }
}