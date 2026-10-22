package com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fisioUrsula.api.shared.enums.TipoExercicio;

public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {

    @Query("""
            SELECT e FROM Exercicio e
            WHERE e.ativo = :ativo
              AND (:tipo IS NULL OR e.tipoExercicio = :tipo)
              AND (:nome IS NULL OR LOWER(e.nome) LIKE LOWER(CONCAT('%', :nome, '%')))
            ORDER BY e.nome ASC
            """)
    List<Exercicio> filtrar(
            @Param("nome") String nome,
            @Param("tipo") TipoExercicio tipo,
            @Param("ativo") boolean ativo);

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);
}