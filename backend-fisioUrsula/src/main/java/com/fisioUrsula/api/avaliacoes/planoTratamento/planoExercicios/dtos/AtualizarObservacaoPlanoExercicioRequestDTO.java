package com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos;

import jakarta.validation.constraints.Size;

public record AtualizarObservacaoPlanoExercicioRequestDTO(
        @Size(max = 255, message = "A observação deve ter no máximo 255 caracteres") String observacao) {
}