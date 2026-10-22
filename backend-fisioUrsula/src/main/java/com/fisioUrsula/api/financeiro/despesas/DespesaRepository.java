package com.fisioUrsula.api.financeiro.despesas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fisioUrsula.api.shared.enums.CategoriaDespesa;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    @Query("""
            SELECT d FROM Despesa d
            WHERE (:categoria IS NULL OR d.categoria = :categoria)
              AND (:inicio IS NULL OR d.dataDespesa >= :inicio)
              AND (:fim IS NULL OR d.dataDespesa <= :fim)
              AND (:busca IS NULL OR LOWER(d.descricao) LIKE LOWER(CONCAT('%', :busca, '%')))
            ORDER BY d.dataDespesa DESC, d.id DESC
            """)
    List<Despesa> filtrar(
            @Param("categoria") CategoriaDespesa categoria,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            @Param("busca") String busca);

    @Query("""
            SELECT SUM(d.valor) FROM Despesa d
            WHERE (:categoria IS NULL OR d.categoria = :categoria)
              AND (:inicio IS NULL OR d.dataDespesa >= :inicio)
              AND (:fim IS NULL OR d.dataDespesa <= :fim)
            """)
    BigDecimal somarValores(
            @Param("categoria") CategoriaDespesa categoria,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);
}