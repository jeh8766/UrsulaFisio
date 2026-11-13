package com.fisioUrsula.api.avaliacoes.diagnosticos.dtos;

import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;

public record DetalharDiagnosticoResponseDTO(
        Long id,
        String nome,
        String descricao
) {
    public DetalharDiagnosticoResponseDTO (Diagnostico diagnostico){
        this(
                diagnostico.getId(),
                diagnostico.getNome(),
                diagnostico.getDescricao()
        );
    }
}
