package com.fisioUrsula.api.atendimentos.sinaisVitais.dtos;

import jakarta.validation.constraints.*;

public record CriarSinaisVitaisRequestDTO(

        @NotBlank
        @Size(max = 15)
        String pressaoArterial,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double saturacao,

        @NotNull
        @Positive
        Integer frequenciaCardiaca,

        @NotNull
        @Positive
        Integer frequenciaRespiratoria
) {
}
