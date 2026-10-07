package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.AgendamentoAvaliacao;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.DiagnosticoAvaliacao;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
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

    @Column(nullable = false, length = 60)
    private String queixaPrincipal;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalDateTime horaInicio;

    @Column(nullable = false)
    private LocalDateTime horaFim;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String observacao;

    @Column(nullable = false, length = 10)
    private Double valor;

    @OneToOne
    @JoinColumn(name = "agendammentoAvaliacao_id", nullable = false)
    private AgendamentoAvaliacao agendamentoAvaliacao;

    @OneToMany(mappedBy = "avaliacao")
    private List<DiagnosticoAvaliacao> diagnosticos;
}
