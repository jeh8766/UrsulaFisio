package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.DiagnosticoAvaliacao;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;

import java.time.LocalDate;

public record DetalharDiagnosticoAvaliacaoResponseDTO(
        Long id,
        Long diagnosticoId,
        LocalDate dataDiagnostico,
        StatusDiagnostico status,
        String observacao
) {
    public DetalharDiagnosticoAvaliacaoResponseDTO(DiagnosticoAvaliacao diagnosticoAvaliacao) {
        this(
                diagnosticoAvaliacao.getId(),
                diagnosticoAvaliacao.getDiagnostico().getId(),
                diagnosticoAvaliacao.getDataDiagnostico(),
                diagnosticoAvaliacao.getStatus(),
                diagnosticoAvaliacao.getObservacao());
    }
}
