package com.fisioUrsula.api.atendimentos.sinaisVitais.dtos;

public record CriarSinaisVitaisRequestDTO(

        String pressaoArterial,
        Double saturacao,
        int frequenciaCardiaca,
        int frequenciaRespiratoria
) {
}
