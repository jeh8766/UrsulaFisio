package com.fisioUrsula.api.atendimentos.atendimento;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.AgendamentoAtendimento;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "atendimentos", uniqueConstraints = {@UniqueConstraint(columnNames = {"data", "horaInicio", "horaFim"})})
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

    @Column(length = 250)
    private String intercorrencia;

    @Column(length = 250)
    private String evolucao;

    @Column(nullable = false)
    private Double valor;

    @Column(nullable = false)
    private Double taxaDeslocamento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;

    @OneToOne
    @JoinColumn(name = "agendamento_atendimento_id")
    private AgendamentoAtendimento agendamentoAtendimento;

    @OneToOne
    @JoinColumn(name = "sinais_Vitais_id")
    private SinaisVitais sinaisVitais;
}
