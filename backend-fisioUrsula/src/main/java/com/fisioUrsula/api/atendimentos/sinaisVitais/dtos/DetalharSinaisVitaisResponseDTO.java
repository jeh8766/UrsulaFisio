package com.fisioUrsula.api.atendimentos.sinaisVitais.dtos;


import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;

public record DetalharSinaisVitaisResponseDTO(
        Long id,
        String pressaoArterial,
        Double saturacao,
        int frequenciaCardiaca,
        int frequenciaRespiratoria,
        Long atendimento_Id
) {
    public DetalharSinaisVitaisResponseDTO(SinaisVitais sinaisVitais) {
        this(
                sinaisVitais.getId(),
                sinaisVitais.getPressaoArterial(),
                sinaisVitais.getSaturacao(),
                sinaisVitais.getFrequenciaCardiaca(),
                sinaisVitais.getFrequenciaRespiratoria(),
                sinaisVitais.getAtendimento() != null
                        ? sinaisVitais.getAtendimento().getId()
                        : null
        );
    }
}