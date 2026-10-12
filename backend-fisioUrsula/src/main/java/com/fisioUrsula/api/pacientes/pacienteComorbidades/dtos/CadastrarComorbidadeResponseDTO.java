package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;

public record CadastrarComorbidadeResponseDTO(Long id, String nome, String descricao, String codigoCID) {

    public CadastrarComorbidadeResponseDTO(Comorbidade comorbidade) {
        this(comorbidade.getId(), comorbidade.getNome(), comorbidade.getDescricao(), comorbidade.getCodigoCID());
    }
}
