package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record AtribuirDiagnosticoDTO(
        @NotNull(message = "A avaliação é obrigatória.") Long avaliacaoId,

        @NotNull(message = "O diagnóstico é obrigatório.") Long diagnosticoId,

        @NotNull(message = "A data do diagnóstico é obrigatória.") LocalDate dataDiagnostico,

        String observacao) {

}