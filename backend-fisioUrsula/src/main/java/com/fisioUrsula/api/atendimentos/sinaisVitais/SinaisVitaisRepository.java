package com.fisioUrsula.api.atendimentos.sinaisVitais;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SinaisVitaisRepository extends JpaRepository<SinaisVitais,Long> {

    Optional<SinaisVitais> findByAtendimentoId(Long atendimentoId);
}
