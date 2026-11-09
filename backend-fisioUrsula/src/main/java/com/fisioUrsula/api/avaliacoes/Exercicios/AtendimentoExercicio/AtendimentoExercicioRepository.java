package com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AtendimentoExercicioRepository extends JpaRepository<AtendimentoExercicio, Long> {

    boolean existsByAtendimento_IdAndExercicio_Id(Long atendimentoID, Long exercicioId);

    List<AtendimentoExercicio> findByAtendimento_Id(Long atendimentoId);
}
