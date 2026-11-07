package com.fisioUrsula.api.pacientes.comorbidades.dtos;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;

public record AtualizarComorbidadeRequestDTO (
        String nome,
        String descricao
) {
    public AtualizarComorbidadeRequestDTO (Comorbidade comorbidade){
        this(
                comorbidade.getNome(),
                comorbidade.getDescricao()
        );
    }
}
