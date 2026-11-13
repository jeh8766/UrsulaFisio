package com.fisioUrsula.api.pacientes.comorbidades.dtos;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;

public record DetalharComorbidadeResponseDTO(
        Long id,
        String nome,
        String descricao
) {
    public DetalharComorbidadeResponseDTO(Comorbidade comorbidade) {

        this(
                comorbidade.getId(),
                comorbidade.getNome(),
                comorbidade.getDescricao()
        );
    }
}
