package com.fisioUrsula.api.avaliacoes.diagnosticos;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico,Long> {

    Optional<Diagnostico> findByNomeIgnoreCase(String nome);

    List<Diagnostico> findByNomeContainingIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

}
