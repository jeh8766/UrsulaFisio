package com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.dtos;

import com.fisioUrsula.api.shared.enums.TipoExercicio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CadastrarExercicioRequestDTO(
        @NotBlank(message = "O nome é obrigatório") @Size(max = 30, message = "O nome deve ter no máximo 30 caracteres") String nome,
        @NotNull(message = "O tipo é obrigatório") TipoExercicio tipo,
        String descricao) {
}