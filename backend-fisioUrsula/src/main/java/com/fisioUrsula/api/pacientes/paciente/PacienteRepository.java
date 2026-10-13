package com.fisioUrsula.api.pacientes.paciente;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    boolean existsByNomeIgnoreCaseAndTelefone(String nome, String telefone);

}
