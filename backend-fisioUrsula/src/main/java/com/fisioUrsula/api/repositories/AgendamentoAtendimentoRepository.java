package com.fisioUrsula.api.repositories;

import com.fisioUrsula.api.entities.AgendamentoAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoAtendimentoRepository extends JpaRepository<AgendamentoAtendimento,Long> {
}
