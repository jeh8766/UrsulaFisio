package com.fisioUrsula.api.pacientes.comorbidades;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


public interface ComorbidadeRepository extends JpaRepository<Comorbidade, Long> {

    Optional<Comorbidade> findByNomeIgnoreCase(String nome);
     boolean existsByCodigoCID(String codigoCID);

    List<Comorbidade> findByNomeContainingIgnoreCase(String nome);
}
