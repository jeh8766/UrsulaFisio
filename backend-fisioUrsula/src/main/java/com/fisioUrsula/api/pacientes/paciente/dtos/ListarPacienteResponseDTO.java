package com.fisioUrsula.api.pacientes.paciente.dtos;

import java.util.List;

import com.fisioUrsula.api.pacientes.paciente.FaixaEtaria;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.Vinculo;
import com.fisioUrsula.api.shared.utils.DataUtil;

public record ListarPacienteResponseDTO(Long id, String nome, Integer idade, FaixaEtaria faixaEtaria,
                                        Vinculo vinculo, String telefone, boolean ativo, List<String> comorbidades) {

    public ListarPacienteResponseDTO(Paciente paciente) {
        this(paciente.getId(), paciente.getNome(),
                DataUtil.calcularIdade(paciente.getDataNascimento()),
                DataUtil.atribuirFaixaEtaria(paciente.getDataNascimento()),
                paciente.getVinculo(), paciente.getTelefone(), paciente.isAtivo(),
                paciente.getComorbidades().stream().map(pc -> pc.getComorbidade().getNome()).toList());
    }
}