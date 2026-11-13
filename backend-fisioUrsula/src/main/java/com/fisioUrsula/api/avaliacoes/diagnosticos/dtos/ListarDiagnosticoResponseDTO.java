package com.fisioUrsula.api.avaliacoes.diagnosticos.dtos;

import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;

public record ListarDiagnosticoResponseDTO(
        Long id,
        String nome,
        String descricao
) {
    public ListarDiagnosticoResponseDTO (Diagnostico diagnostico){
        this(
                diagnostico.getId(),
                diagnostico.getNome(),
                diagnostico.getDescricao()
        );
    }
}
