package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.StatusDiagnostico;
import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;
import com.fisioUrsula.api.pacientes.paciente.Paciente;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pacientes_comorbidades")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class PacienteComorbidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate dataDiagnostico;

    @Enumerated(EnumType.STRING)
    private StatusDiagnostico statusDiagnostico;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "comorbidade_id", nullable = false)
    private Comorbidade comorbidade;

}
