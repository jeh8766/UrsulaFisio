package com.fisioUrsula.api.atendimentos.sinaisVitais.dtos;

public record CriarSinaisVitaisResponseDTO(
        String pressaoArterial,
        Double saturacao,
        int frequenciaCardiaca,
        int frequenciaRespiratoria
) {
}
