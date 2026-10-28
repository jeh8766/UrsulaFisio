package com.fisioUrsula.api.atendimentos.sinaisVitais.dtos;

import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;

public record AtualizarSinaisVitaisRequestDTO(

        String pressaoArterial,
        Double saturacao,
        Integer frequenciaCardiaca,
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
