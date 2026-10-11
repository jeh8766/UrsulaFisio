package com.fisioUrsula.api.pacientes.paciente.dtos;

import java.time.LocalDate;

import com.fisioUrsula.api.pacientes.endereco.Estado;
import com.fisioUrsula.api.pacientes.paciente.Vinculo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

public record CadastrarPacienteRequestDTO(
                @NotBlank(message = "O nome é obrigatório") String nome,

                @NotNull(message = "A data de nascimento é obrigatória") @Past(message = "A data de nascimento deve ser no passado") LocalDate dataNascimento,

                @NotNull(message = "O vínculo é obrigatório") Vinculo vinculo,

                String nomeResponsavel,

                @NotBlank(message = "O telefone é obrigatório") @Pattern(regexp = "^(\\(?\\d{2}\\)?\\s?)?\\d{4,5}-?\\d{4}$", message = "Telefone inválido") String telefone,

                @NotBlank(message = "O CEP é obrigatório") @Pattern(regexp = "\\d{5}-\\d{3}", message = "CEP inválido") String cep,

                @NotNull(message = "O estado é obrigatório") Estado estado,

                @NotBlank(message = "A cidade é obrigatória") String cidade,

                @NotBlank(message = "O bairro é obrigatório") String bairro,

                @NotBlank(message = "A rua é obrigatória") String rua,

                @NotNull(message = "O número é obrigatório") Integer numero,

                String complemento) {
}
