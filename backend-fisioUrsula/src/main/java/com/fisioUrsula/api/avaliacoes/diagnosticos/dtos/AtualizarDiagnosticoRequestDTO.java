package com.fisioUrsula.api.avaliacoes.diagnosticos.dtos;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarDiagnosticoRequestDTO(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 40, message = "O nome deve ter até 40 caracteres.") String nome,

        @Size(max = 60, message = "A descrição deve ter até 60 caracteres.") String descricao

        ) {

}
