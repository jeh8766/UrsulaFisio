package com.fisioUrsula.api.pacientes.comorbidades.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastrarComorbidadeRequestDTO(

        @NotBlank
        @NotNull
        String nome,
        String descricao
) {
}
