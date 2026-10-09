package com.fisioUrsula.api.agendamentos.agendamentoAtendimento;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento.PlanoTratamento;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "agendamentos_atendimentos", uniqueConstraints = {@UniqueConstraint(columnNames = {"data", "horaInicio", "horaFim"})})
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class AgendamentoAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private LocalTime horaFim;

    @ManyToOne
    @JoinColumn(name = "paciente", nullable = false)
    private Paciente paciente;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    private LocalDate dataCancelamento;

    @ManyToOne
    @JoinColumn(name = "plano_tratamento_id")
    private PlanoTratamento planoTratamento;

    @OneToOne(mappedBy = "agendamentoAtendimento")
    private Atendimento atendimento;
}
