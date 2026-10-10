package com.fisioUrsula.api.pacientes.paciente.dtos;

import java.time.LocalDate;

import com.fisioUrsula.api.pacientes.endereco.Estado;
import com.fisioUrsula.api.pacientes.paciente.Vinculo;

public record CadastrarPacienteRequestDTO(String nome, LocalDate dataNascimento, Vinculo vinculo,
        String nomeResponsavel, String telefone, String cep, Estado estado, String cidade, String bairro,
        Integer numero, String complemento) {
}
