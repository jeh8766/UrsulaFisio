package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CadastrarComorbidadeRequestDTO(
        @NotBlank String nome,
        String descricao,
        @Pattern(regexp = "^[A-Z]\\d{2}(\\.\\d{1,2})?$", message = "CID inválido. Utilize o formato do CID-10, como E11 ou M54.5") String codigoCID) {
}
