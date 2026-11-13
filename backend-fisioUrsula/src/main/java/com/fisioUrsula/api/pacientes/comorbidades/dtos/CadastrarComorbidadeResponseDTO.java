package com.fisioUrsula.api.pacientes.comorbidades.dtos;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;

public record CadastrarComorbidadeResponseDTO(
        Long id, String nome, String descricao
) {

    public CadastrarComorbidadeResponseDTO(Comorbidade comorbidade) {
        this(comorbidade.getId(), comorbidade.getNome(), comorbidade.getDescricao());
    }
}
