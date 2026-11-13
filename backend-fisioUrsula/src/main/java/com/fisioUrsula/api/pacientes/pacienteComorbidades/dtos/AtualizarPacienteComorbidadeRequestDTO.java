package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;

import java.time.LocalDate;

public record AtualizarPacienteComorbidadeRequestDTO(
        LocalDate dataDiagnostico,
        String observacao
) {
    public AtualizarPacienteComorbidadeRequestDTO(PacienteComorbidade pacienteComorbidade){
        this(
                pacienteComorbidade.getDataDiagnostico(),
                pacienteComorbidade.getObservacao()
        );
    }
}
