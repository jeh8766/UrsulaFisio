package com.fisioUrsula.api.atendimentos.atendimento;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

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
@Table(name = "atendimentos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate data;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFim;
    private String intercorrencia;
    private String evolucao;
    private Double valor;
    private Double taxaDeslocamento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;

}
