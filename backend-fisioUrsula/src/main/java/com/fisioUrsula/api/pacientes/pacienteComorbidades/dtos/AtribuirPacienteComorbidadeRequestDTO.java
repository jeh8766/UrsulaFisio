package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import java.time.LocalDate;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;
import jakarta.validation.constraints.NotNull;

public record AtribuirPacienteComorbidadeRequestDTO(
        @NotNull Long comorbidadeId,
        LocalDate dataDiagnostico,
        String observacoes) {

    public AtribuirPacienteComorbidadeRequestDTO(PacienteComorbidade pacienteComorbidade){
        this(
                pacienteComorbidade.getId(),
                pacienteComorbidade.getDataDiagnostico(),
                pacienteComorbidade.getObservacao()
        );
    }

}
