package com.fisioUrsula.api.atendimentos.sinaisVitais;

import java.io.Serializable;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sinais_vitais")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class SinaisVitais implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 15)
    private String pressaoArterial;

    @Column(nullable = false, length = 15)
    private Double saturacao;

    @Column(nullable = false, length = 15)
    private int frequenciaCardiaca;

}
