package com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios;

import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.Exercicio;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento.PlanoTratamento;

import jakarta.persistence.Entity;
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
@Table(name = "planos_exercicios")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class PlanoExercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String observacao;

    @ManyToOne
    @JoinColumn(name = "plano_tratamento_id", nullable = false)
    private PlanoTratamento planoTratamento;

    @ManyToOne
    @JoinColumn(name = "exercicio_id")
    private Exercicio exercicio;
}
