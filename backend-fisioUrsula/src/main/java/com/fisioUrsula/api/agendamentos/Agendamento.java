package com.fisioUrsula.api.agendamentos;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.agendamentos.dtos.AgendarAvaliacaoRequestDTO;
import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento.PlanoTratamento;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "agendamentos", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "data", "horaInicio", "horaFim" }) })
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Agendamento {

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
    @Column(nullable = false)
    private TipoAgendamento tipoAgendamento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    private LocalDate dataCancelamento;

    @ManyToOne
    @JoinColumn(name = "plano_tratamento_id")
    private PlanoTratamento planoTratamento;

    @ManyToOne
    @JoinColumn(name = "paciente", nullable = false)
    private Paciente paciente;

    @OneToOne(mappedBy = "agendamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private Atendimento atendimento;

    @OneToOne(mappedBy = "agendamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private Avaliacao avaliacao;

    public Agendamento(AgendarAvaliacaoRequestDTO dto, Paciente paciente) {
        this.paciente = paciente;
        this.data = dto.data();
        this.horaInicio = dto.horaInicio();
        this.horaFim = dto.horaFim();
        this.statusAgendamento = StatusAgendamento.PENDENTE;
        this.tipoAgendamento = TipoAgendamento.AVALIACAO;
    }

}
