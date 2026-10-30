package com.fisioUrsula.api.atendimentos.sinaisVitais.dtos;

public record CriarSinaisVitaisResponseDTO(
        Long id,
        String pressaoArterial,
        Double saturacao,
        int frequenciaCardiaca,
        int frequenciaRespiratoria
) {}
