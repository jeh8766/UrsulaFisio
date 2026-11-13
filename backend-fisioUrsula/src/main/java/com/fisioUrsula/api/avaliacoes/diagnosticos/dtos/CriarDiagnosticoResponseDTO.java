package com.fisioUrsula.api.avaliacoes.diagnosticos.dtos;

import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;

public record CriarDiagnosticoResponseDTO(
        Long id,
        String nome,
        String descricao
) {
    public CriarDiagnosticoResponseDTO(Diagnostico diagnostico) {
        this(
                diagnostico.getId(),
                diagnostico.getNome(),
                diagnostico.getDescricao()
        );
    }
}
