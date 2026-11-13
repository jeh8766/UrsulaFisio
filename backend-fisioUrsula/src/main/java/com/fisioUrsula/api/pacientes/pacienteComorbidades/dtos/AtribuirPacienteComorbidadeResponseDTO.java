package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import java.time.LocalDate;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;

public record AtribuirPacienteComorbidadeResponseDTO(
        Long id,
        Long pacienteId,
        Long comorbidadeId,
        String nomeComorbidade,
        LocalDate dataDiagnostico,
        StatusDiagnostico statusDiagnostico,
        String observacao) {

    public AtribuirPacienteComorbidadeResponseDTO(PacienteComorbidade pacienteComorbidade) {
        this(
                pacienteComorbidade.getId(),
                pacienteComorbidade.getPaciente().getId(),
                pacienteComorbidade.getComorbidade().getId(),
                pacienteComorbidade.getComorbidade().getNome(),
                pacienteComorbidade.getDataDiagnostico(),
                pacienteComorbidade.getStatusDiagnostico(),
                pacienteComorbidade.getObservacao());
    }
}
