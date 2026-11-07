package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PacienteComorbidadeRepository extends JpaRepository<PacienteComorbidade, Long> {

    Optional<PacienteComorbidade> findByPaciente_IdAndComorbidade_Id(Long pacienteId, Long comorbidadeId);

    List<PacienteComorbidade> findByPaciente_id(Long pacienteId);
}
