package com.fisioUrsula.api.atendimentos.atendimento;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import jakarta.persistence.*;
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

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalDateTime horaInicio;

    @Column(nullable = false)
    private LocalDateTime horaFim;

    @Column(nullable = false, length = 25)
    private String intercorrencia;

    @Column(nullable = false, length = 60)
    private String evolucao;

    @Column(nullable = false, length = 20)
    private Double valor;

    @Column(nullable = false, length = 20)
    private Double taxaDeslocamento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;

}
