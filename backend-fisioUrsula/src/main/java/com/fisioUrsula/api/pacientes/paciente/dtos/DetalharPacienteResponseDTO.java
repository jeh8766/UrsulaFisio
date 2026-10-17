package com.fisioUrsula.api.pacientes.paciente.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.shared.enums.Estado;
import com.fisioUrsula.api.shared.enums.FaixaEtaria;
import com.fisioUrsula.api.shared.enums.Vinculo;
import com.fisioUrsula.api.shared.utils.DataUtil;

public record DetalharPacienteResponseDTO(Long id, String nome, LocalDate dataNascimento, Integer idade,
                                          FaixaEtaria faixaEtaria, Vinculo vinculo, String nomeResponsavel, String telefone,
                                          LocalDateTime criadoEm, boolean ativo, String cep, Estado estado, String cidade, String bairro,
                                          String rua, Integer numero, String complemento, List<String> comorbidades) {

    public DetalharPacienteResponseDTO(Paciente p) {
        this(p.getId(), p.getNome(), p.getDataNascimento(),
                DataUtil.calcularIdade(p.getDataNascimento()),
                DataUtil.atribuirFaixaEtaria(p.getDataNascimento()),
                p.getVinculo(), p.getNomeResponsavel(), p.getTelefone(), p.getCriadoEm(), p.isAtivo(),
                p.getEndereco().getCep(), p.getEndereco().getEstado(), p.getEndereco().getCidade(),
                p.getEndereco().getBairro(), p.getEndereco().getRua(), p.getEndereco().getNumero(),
                p.getEndereco().getComplemento(),
                p.getComorbidades().stream().map(pc -> pc.getComorbidade().getNome()).toList());
    }
}