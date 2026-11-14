package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.DiagnosticoAvaliacao;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;

public record ListarDiagnosticosAvaliacaoResponseDTO(
        Long id,
        Long diagnosticoId,
        LocalDate dataDiagnostico,
        StatusDiagnostico status,
        String observacao) {

    public ListarDiagnosticosAvaliacaoResponseDTO(DiagnosticoAvaliacao diagnosticoAvaliacao) {
        this(
                diagnosticoAvaliacao.getId(),
                diagnosticoAvaliacao.getDiagnostico().getId(),
                diagnosticoAvaliacao.getDataDiagnostico(),
                diagnosticoAvaliacao.getStatus(),
                diagnosticoAvaliacao.getObservacao());
    }
}