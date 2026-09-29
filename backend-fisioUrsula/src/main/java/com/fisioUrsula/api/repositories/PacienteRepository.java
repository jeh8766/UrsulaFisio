package com.fisioUrsula.api.repositories;

import com.fisioUrsula.api.entities.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Endereco,Long> {
}
