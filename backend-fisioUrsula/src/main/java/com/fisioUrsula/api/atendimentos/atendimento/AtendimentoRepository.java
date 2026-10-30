
package com.fisioUrsula.api.atendimentos.atendimento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {

    Optional<Atendimento> findByAgendamento_Id(Long agendamentoId);

    List<Atendimento> findByAgendamento_Paciente_IdOrderByAgendamento_DataDesc(
            Long pacienteId
    );

    List<Atendimento> findByAgendamento_DataBetween(
            LocalDate dataInicio,
            LocalDate dataFim
    );
}
