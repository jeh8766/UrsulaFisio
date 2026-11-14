package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtribuirDiagnosticoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtualizarDiagnosticoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "diagnosticos_avaliacoes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_avaliacao_diagnostico",
                        columnNames = {"avaliacao_id", "diagnostico_id"}
                )
        })
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

    private LocalDate dataDiagnostico;

    @Enumerated(EnumType.STRING)
    private StatusDiagnostico status;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @ManyToOne
    @JoinColumn(name = "diagnostico_id", nullable = false)
    private Diagnostico diagnostico;

    @ManyToOne
    @JoinColumn(name = "avaliacao_id")
    private Avaliacao avaliacao;

}