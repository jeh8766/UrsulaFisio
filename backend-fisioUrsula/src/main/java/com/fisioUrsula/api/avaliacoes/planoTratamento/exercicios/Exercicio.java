package com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios;

import java.io.Serializable;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "exercicios")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Exercicio implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 30)
    private String nome;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoExercicio tipoExercicio;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

}
