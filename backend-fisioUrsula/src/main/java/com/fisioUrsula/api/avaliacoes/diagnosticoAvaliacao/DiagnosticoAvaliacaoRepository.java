package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosticoAvaliacaoRepository extends JpaRepository<DiagnosticoAvaliacao, Long> {

    List<DiagnosticoAvaliacao> findByAvaliacaoId(Long avaliacaoId);

    Optional<DiagnosticoAvaliacao> findByAvaliacao_IdAndDiagnostico_Id(Long avaliacaoId, Long diagnosticoId);

}