package com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdicionarExercicioAoPlanoRequestDTO(
        @NotNull(message = "O exercício é obrigatório") Long exercicioId,
        @Size(max = 255, message = "A observação deve ter no máximo 255 caracteres") String observacao) {
}