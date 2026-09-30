package com.fisioUrsula.api.repositories;

import com.fisioUrsula.api.entities.Atendimento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtendimentoRepository  extends JpaRepository<Atendimento,Long> {
}
