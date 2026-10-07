package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;

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
@Table(name = "diagnosticos_avaliacoes")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class DiagnosticoAvaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private LocalDate dataDiagnostico;

    @Enumerated(EnumType.STRING)
    private StatusDiagnostico statusDiagnostico;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String observacao;

    @ManyToOne
    @JoinColumn(name = "diagnostico_id", nullable = false)
    private Diagnostico diagnostico;

    @ManyToOne
    @JoinColumn(name = "avaliacao_id")
    private Avaliacao avaliacao;

}
