package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.StatusDiagnostico;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    private String observacao;

}
