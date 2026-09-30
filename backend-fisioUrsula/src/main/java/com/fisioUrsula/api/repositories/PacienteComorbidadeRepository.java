package com.fisioUrsula.api.repositories;

import com.fisioUrsula.api.entities.PacienteComorbidade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteComorbidadeRepository extends JpaRepository<PacienteComorbidade,Long> {
}
