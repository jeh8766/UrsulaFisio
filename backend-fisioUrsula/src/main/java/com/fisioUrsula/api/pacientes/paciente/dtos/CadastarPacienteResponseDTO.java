package com.fisioUrsula.api.pacientes.paciente.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fisioUrsula.api.pacientes.endereco.Estado;
import com.fisioUrsula.api.pacientes.paciente.FaixaEtaria;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.Vinculo;
import com.fisioUrsula.api.shared.utils.DataUtil;

public record CadastarPacienteResponseDTO(Long id, String nome, LocalDate dataNascimento, Integer idade,
        FaixaEtaria faixaEtaria, Vinculo vinculo,
        String nomeResponsavel, String telefone, LocalDateTime criadoEm, String cep, Estado estado, String cidade, String bairro,
        Integer numero, String complemento) {

    public CadastarPacienteResponseDTO(Paciente paciente) {
        this(paciente.getId(), paciente.getNome(), paciente.getDataNascimento(),
                DataUtil.calcularIdade(paciente.getDataNascimento()),
                DataUtil.atribuirFaixaEtaria(paciente.getDataNascimento()), paciente.getVinculo(),
                paciente.getNomeResponsavel(), paciente.getTelefone(), paciente.getCriadoEm(), paciente.getEndereco().getCep(),
                paciente.getEndereco().getEstado(), paciente.getEndereco().getCidade(),
                paciente.getEndereco().getBairro(), paciente.getEndereco().getNumero(),
                paciente.getEndereco().getComplemento());

    }

}
