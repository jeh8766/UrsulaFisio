package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.DiagnosticoAvaliacao;
import jakarta.validation.constraints.NotNull;

public record AtualizarDiagnosticoAvaliacaoRequestDTO(
        LocalDate dataDiagnostico,
        String observacao)
{

    public AtualizarDiagnosticoAvaliacaoRequestDTO (DiagnosticoAvaliacao diagnosticoAvaliacao){
        this(
                diagnosticoAvaliacao.getDataDiagnostico(),
                diagnosticoAvaliacao.getObservacao()
        );
    }
}