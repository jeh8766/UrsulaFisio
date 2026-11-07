package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;

import java.time.LocalDate;

public record DetalharPacienteComorbidadeResponseDTO (

        Long id,
        LocalDate dataDiagnostico,
        StatusDiagnostico statusDiagnostico,
        String observacao,
        String pacienteNome,
        String comorbidadeNome
) {
    public DetalharPacienteComorbidadeResponseDTO (PacienteComorbidade pacienteComorbidade){
        this(
                pacienteComorbidade.getId(),
                pacienteComorbidade.getDataDiagnostico(),
                pacienteComorbidade.getStatusDiagnostico(),
                pacienteComorbidade.getObservacao(),
                pacienteComorbidade.getPaciente().getNome(),
                pacienteComorbidade.getComorbidade().getNome()
        );
    }
}
