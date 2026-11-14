package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.AtendimentoExercicio;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "atendimentos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String intercorrencia;

    @Column(columnDefinition = "TEXT")
    private String evolucao;

    @Column(precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Column(precision = 10, scale = 2)
    private BigDecimal taxaDeslocamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAtendimento statusAtendimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPagamento statusPagamento;

    @OneToOne(optional = false)
    @JoinColumn(name = "agendamento_id", nullable = false, unique = true)
    private Agendamento agendamento;

    @OneToOne(optional = false)
    @JoinColumn(name = "sinais_vitais_id", nullable = false, unique = true)
    private SinaisVitais sinaisVitais;

    @OneToMany(
            mappedBy = "atendimento",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<AtendimentoExercicio> exercicios = new ArrayList<>();
}