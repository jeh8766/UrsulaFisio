package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record AtualizarDiagnosticoDaAvaliacaoDTO(
        @NotNull(message = "A data do diagnóstico é obrigatória.") LocalDate dataDiagnostico,

        String observacao) {

}