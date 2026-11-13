package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosticoAvaliacaoRepository extends JpaRepository<DiagnosticoAvaliacao, Long> {

    List<DiagnosticoAvaliacao> findByAvaliacaoId(Long avaliacaoId);
}