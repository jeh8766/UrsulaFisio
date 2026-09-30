package com.fisioUrsula.api.entities;

import com.fisioUrsula.api.enums.FaixaEtaria;
import com.fisioUrsula.api.enums.Vinculo;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor
@NoArgsConstructor
public class Paciente implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private int idade;

    @Enumerated(EnumType.STRING)
    private FaixaEtaria faixaEtaria;

    @Enumerated(EnumType.STRING)
    private Vinculo vinculo;

    private LocalDate dataNascimento;

    private String nome;

    private String nomeResponsavel;

    private String telefone;

}
