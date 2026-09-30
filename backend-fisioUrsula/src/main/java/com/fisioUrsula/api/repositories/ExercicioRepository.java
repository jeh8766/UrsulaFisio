package com.fisioUrsula.api.repositories;

import com.fisioUrsula.api.entities.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExercicioRepository extends JpaRepository<Exercicio,Long> {
}
