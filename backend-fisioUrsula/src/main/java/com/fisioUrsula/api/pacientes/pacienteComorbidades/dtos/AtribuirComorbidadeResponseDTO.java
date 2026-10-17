package com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos;

import java.time.LocalDate;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;

public record AtribuirComorbidadeResponseDTO(
        Long id,
        Long pacienteId,
        Long comorbidadeId,
        String nomeComorbidade,
        String codigoCID,
        LocalDate dataDiagnostico,
        StatusDiagnostico statusDiagnostico,
        String observacao) {

    public AtribuirComorbidadeResponseDTO(PacienteComorbidade pacienteComorbidade) {
        this(
                pacienteComorbidade.getId(),
                pacienteComorbidade.getPaciente().getId(),
                pacienteComorbidade.getComorbidade().getId(),
                pacienteComorbidade.getComorbidade().getNome(),
                pacienteComorbidade.getComorbidade().getCodigoCID(),
                pacienteComorbidade.getDataDiagnostico(),
                pacienteComorbidade.getStatusDiagnostico(),
                pacienteComorbidade.getObservacao());
    }
}
