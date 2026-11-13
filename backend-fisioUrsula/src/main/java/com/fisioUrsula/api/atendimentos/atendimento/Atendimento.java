package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.AtendimentoExercicio;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "atendimentos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 250)
    private String intercorrencia;

    @Column(length = 250)
    private String evolucao;

    private BigDecimal valor;

    private BigDecimal taxaDeslocamento;

    @Enumerated(EnumType.STRING)
    private StatusAtendimento statusAtendimento;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;

    @OneToOne
    @JoinColumn(name = "agendamento_id", unique = true)
    private Agendamento agendamento;

    @OneToOne
    @JoinColumn(name = "sinais_vitais_id", unique = true)
    private SinaisVitais sinaisVitais;

    @OneToMany(
            mappedBy = "atendimento",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<AtendimentoExercicio> exercicios = new ArrayList<>();
}