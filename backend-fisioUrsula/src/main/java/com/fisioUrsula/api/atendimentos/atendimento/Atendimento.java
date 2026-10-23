package com.fisioUrsula.api.atendimentos.atendimento;

import java.math.BigDecimal;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
    @JoinColumn(name = "sinais_Vitais_id")
    private SinaisVitais sinaisVitais;
}
