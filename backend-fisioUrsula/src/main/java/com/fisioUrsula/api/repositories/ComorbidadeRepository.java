package com.fisioUrsula.api.repositories;

import com.fisioUrsula.api.entities.Comorbidade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComorbidadeRepository extends JpaRepository<Comorbidade,Long> {
}
