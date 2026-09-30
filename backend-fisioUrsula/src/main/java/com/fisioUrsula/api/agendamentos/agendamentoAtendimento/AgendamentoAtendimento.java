package com.fisioUrsula.api.agendamentos.agendamentoAtendimento;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "agendamentos_atendimentos")
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

    private LocalDate data;
    private LocalTime horaInicio;
    private LocalTime horaFim;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    private LocalDate dataCancelamento;

}
