package com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento;

import java.io.Serializable;

import com.fisioUrsula.api.atendimentos.atendimento.TipoAtendimento;

import jakarta.persistence.*;
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

    @Column(nullable = false, length =15)
    private Double valorPadrao;

    @Enumerated(EnumType.STRING)
    private TipoAtendimento tipoAtendimento;


}
