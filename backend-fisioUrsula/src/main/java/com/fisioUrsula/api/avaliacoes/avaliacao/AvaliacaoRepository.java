package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    @Query("""
            SELECT a FROM Avaliacao a
            WHERE a.agendamento.paciente.id = :pacienteId
            ORDER BY a.agendamento.data DESC, a.agendamento.horaInicio DESC
            """)
    List<Avaliacao> listarPorPaciente(@Param("pacienteId") Long pacienteId);

    @Query("""
            SELECT a FROM Avaliacao a
            WHERE a.agendamento.data = :data
            ORDER BY a.agendamento.horaInicio ASC
            """)
    List<Avaliacao> listarPorData(@Param("data") LocalDate data);
}