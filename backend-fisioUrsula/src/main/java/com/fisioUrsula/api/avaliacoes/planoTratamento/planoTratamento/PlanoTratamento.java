package com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento;

import java.io.Serializable;
import java.util.List;

import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.AgendamentoAtendimento;
import com.fisioUrsula.api.atendimentos.atendimento.TipoAtendimento;
import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.PlanoExercicio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "planos_tratamentos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class PlanoTratamento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    @Column(nullable = false, length = 3)
    private int quantidadeSessoes;

    @Column(nullable = false, length = 3)
    private String frequencia;

    @Column(nullable = false, length = 15)
    private Double taxaDeslocPadrao;

    @Column(nullable = false, length = 15)
    private Double valorPadrao;

    @Enumerated(EnumType.STRING)
    private TipoAtendimento tipoAtendimento;

    @OneToOne
    @JoinColumn(name = "avaliacao_id", nullable = false, unique = true)
    private Avaliacao avaliacao;

    @OneToMany(mappedBy = "planoTratamento")
    private List<PlanoExercicio> planosDeExercicio;

    @OneToMany(mappedBy = "planoTratamento")
    private List<AgendamentoAtendimento> agendamentosDeAtendimento;
}
