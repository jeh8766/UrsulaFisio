package com.fisioUrsula.api.pacientes.paciente.dtos;

import com.fisioUrsula.api.pacientes.paciente.Paciente;

public record PacienteResumoResponseDTO(
        Long id,
        String nome,
        String telefone
) {
    public PacienteResumoResponseDTO(Paciente paciente) {
        this(
                paciente.getId(),
                paciente.getNome(),
                paciente.getTelefone()
        );
    }
}
