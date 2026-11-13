package com.fisioUrsula.api.avaliacoes.Exercicios.exercicios.dtos;

import com.fisioUrsula.api.shared.enums.TipoExercicio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CadastrarExercicioRequestDTO(
        @NotBlank(message = "O nome é obrigatório") String nome,
        @NotNull(message = "O tipo é obrigatório") TipoExercicio tipo,
        String descricao) {
}