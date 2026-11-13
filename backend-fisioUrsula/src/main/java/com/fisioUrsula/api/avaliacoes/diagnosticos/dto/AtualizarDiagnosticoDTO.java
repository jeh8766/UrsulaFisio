package com.fisioUrsula.api.avaliacoes.diagnosticos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarDiagnosticoDTO(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 40, message = "O nome deve ter até 40 caracteres.") String nome,

        @Size(max = 60, message = "A descrição deve ter até 60 caracteres.") String descricao,

        @NotBlank(message = "O código CID é obrigatório.")
        @Size(max = 6, message = "O código CID deve ter até 6 caracteres.") String codigoCID) {

}