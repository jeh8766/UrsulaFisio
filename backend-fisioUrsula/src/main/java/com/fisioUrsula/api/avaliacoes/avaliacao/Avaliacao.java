package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.DiagnosticoAvaliacao;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento.PlanoTratamento;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "avaliacoes")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Avaliacao implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 60)
    private String queixaPrincipal;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;

    @Enumerated(EnumType.STRING)
    private StatusAtendimento statusAtendimento;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    private BigDecimal valor;

    @OneToOne
    @JoinColumn(name = "agendamento_id", nullable = false, unique = true)
    private Agendamento agendamento;

    @OneToMany(mappedBy = "avaliacao")
    private List<DiagnosticoAvaliacao> diagnosticos;

    @OneToOne(mappedBy = "avaliacao")
    private PlanoTratamento planoTratamento;

}