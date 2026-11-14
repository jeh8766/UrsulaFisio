
package com.fisioUrsula.api.atendimentos.atendimento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {

    List<Atendimento> findByAgendamento_Paciente_IdOrderByAgendamento_DataDesc(
            Long pacienteId
    );

    List<Atendimento> findByAgendamento_DataBetween(
            LocalDate dataInicio,
            LocalDate dataFim
    );

    List<Atendimento> findByDataPagamentoBetween(
            LocalDate dataInicio,
            LocalDate dataFim);

    boolean existsByAgendamento_Id(Long agendamentoId);
}
