package com.fisioUrsula.api.atendimentos.sinaisVitais.dtos;

import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import jakarta.validation.constraints.*;

public record AtualizarSinaisVitaisRequestDTO(

        @Size(max = 15)
        String pressaoArterial,

        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double saturacao,

        @Positive
        Integer frequenciaCardiaca,

        @Positive
        Integer frequenciaRespiratoria
) {
    public AtualizarSinaisVitaisRequestDTO(SinaisVitais sinaisVitais){
        this(
                sinaisVitais.getPressaoArterial(),
                sinaisVitais.getSaturacao(),
                sinaisVitais.getFrequenciaCardiaca(),
                sinaisVitais.getFrequenciaRespiratoria()
        );
    }
}
