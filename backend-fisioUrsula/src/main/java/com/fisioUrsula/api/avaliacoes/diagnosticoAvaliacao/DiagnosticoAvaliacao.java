package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.time.LocalDate;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtribuirDiagnosticoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtualizarDiagnosticoDaAvaliacaoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;

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

    public DiagnosticoAvaliacao(AtribuirDiagnosticoDTO dto, Avaliacao avaliacao, Diagnostico diagnostico) {
        this.dataDiagnostico = dto.dataDiagnostico();
        this.observacao = dto.observacao();
        this.status = StatusDiagnostico.ATIVO;
        this.avaliacao = avaliacao;
        this.diagnostico = diagnostico;
    }

    public void atualizar(AtualizarDiagnosticoDaAvaliacaoDTO dto) {
        this.dataDiagnostico = dto.dataDiagnostico();
        this.observacao = dto.observacao();
    }

    public void ativar() {
        this.status = StatusDiagnostico.ATIVO;
    }

    public void inativar() {
        this.status = StatusDiagnostico.INATIVO;
    }

}