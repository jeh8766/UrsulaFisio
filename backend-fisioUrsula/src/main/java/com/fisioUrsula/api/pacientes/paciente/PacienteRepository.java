package com.fisioUrsula.api.pacientes.paciente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PacienteRepository extends JpaRepository<Paciente, Long>, JpaSpecificationExecutor<Paciente> {
    boolean existsByNomeIgnoreCaseAndTelefone(String nome, String telefone);

    boolean existsByNomeIgnoreCaseAndTelefoneAndIdNot(String nome, String telefone, Long id);

}
