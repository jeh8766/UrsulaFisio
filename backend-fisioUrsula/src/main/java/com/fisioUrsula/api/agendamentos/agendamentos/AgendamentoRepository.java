package com.fisioUrsula.api.agendamentos.agendamentos;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

        @Query("""
                        SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
                        FROM Agendamento a
                        WHERE a.data = :data
                            AND a.horaInicio < :horaFim
                            AND a.horaFim > :horaInicio
                            AND a.statusAgendamento <> :statusCancelado
                                    """)
        boolean existeConflito(
                        @Param("data") LocalDate data,
                        @Param("horaInicio") LocalTime horaInicio,
                        @Param("horaFim") LocalTime horaFim,
                        @Param("statusCancelado") StatusAgendamento statusCancelado);
}
