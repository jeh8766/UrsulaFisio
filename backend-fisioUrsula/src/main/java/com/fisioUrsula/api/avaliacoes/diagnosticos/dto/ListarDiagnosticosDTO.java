package com.fisioUrsula.api.avaliacoes.diagnosticos.dto;

import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;

public record ListarDiagnosticosDTO(Long id,
                                    String nome,
                                    String descricao,
                                    String codigoCID) {

    public ListarDiagnosticosDTO(Diagnostico diagnostico) {
        this(
                diagnostico.getId(),
                diagnostico.getNome(),
                diagnostico.getDescricao(),
                diagnostico.getCodigoCID());
    }
}