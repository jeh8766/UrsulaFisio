package com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento;

import java.io.Serializable;

import com.fisioUrsula.api.atendimentos.atendimento.TipoAtendimento;

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

    private int quantidadeSessoes;
    private String frequencia;
    private Double taxaDeslocPadrao;
    private Double valorPadrao;

    @Enumerated(EnumType.STRING)
    private TipoAtendimento tipoAtendimento;


}
