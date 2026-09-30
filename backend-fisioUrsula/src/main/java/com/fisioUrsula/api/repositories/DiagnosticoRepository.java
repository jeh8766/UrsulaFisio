package com.fisioUrsula.api.repositories;

import com.fisioUrsula.api.entities.Diagnostico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico,Long> {
}
