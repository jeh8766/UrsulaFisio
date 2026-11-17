
package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.shared.enums.StatusPagamento;
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

    List<Atendimento> findByDataPagamentoBetweenAndStatusPagamento(
            LocalDate inicio,
            LocalDate fim,
            StatusPagamento statusPagamento
    );


    boolean existsByAgendamento_Id(Long agendamentoId);
}
