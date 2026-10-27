package com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanoExercicioRepository extends JpaRepository<PlanoExercicio, Long> {

    List<PlanoExercicio> findByPlanoTratamentoIdOrderByExercicioNomeAsc(Long planoTratamentoId);

    Optional<PlanoExercicio> findByIdAndPlanoTratamentoId(Long id, Long planoTratamentoId);

    boolean existsByPlanoTratamentoIdAndExercicioId(Long planoTratamentoId, Long exercicioId);
}