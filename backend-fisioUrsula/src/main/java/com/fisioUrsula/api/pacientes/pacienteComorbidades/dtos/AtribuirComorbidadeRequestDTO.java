package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.StatusDiagnostico;

import jakarta.validation.constraints.NotNull;

public record AtribuirComorbidadeRequestDTO(
        @NotNull Long comorbidadeId,
        LocalDate dataDiagnostico,
        StatusDiagnostico statusDiagnostico,
        String observacoes) {

}
