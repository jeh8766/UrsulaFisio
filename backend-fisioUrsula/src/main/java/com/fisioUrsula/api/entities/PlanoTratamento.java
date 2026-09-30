package com.fisioUrsula.api.entities;

import com.fisioUrsula.api.enums.TipoAtendimento;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "planos_tratamentos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor
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
