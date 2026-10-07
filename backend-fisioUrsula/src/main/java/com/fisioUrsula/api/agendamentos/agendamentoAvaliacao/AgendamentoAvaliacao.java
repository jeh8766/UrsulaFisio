package com.fisioUrsula.api.agendamentos.agendamentoAvaliacao;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;

import jakarta.persistence.CascadeType;
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
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "agendamentos_avaliacoes")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class AgendamentoAvaliacao {

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

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    @Column(nullable = false)
    private LocalDate dataCancelamento;

    @ManyToOne
    @JoinColumn(name = "paciente", nullable = false)
    private Paciente paciente;

    @OneToOne(mappedBy = "agendamentoAvaliacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private Avaliacao avaliacao;

}
