package com.fisioUrsula.api.pacientes.paciente;

import java.io.Serializable;
import java.time.LocalDate;

import com.fisioUrsula.api.pacientes.endereco.Endereco;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Paciente implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column (name = "id_paciente")
    private Long id;

    @Column (nullable = false, length = 3)
    private int idade;

    @Enumerated(EnumType.STRING)
    @Column (nullable = false, length = 20)
    private FaixaEtaria faixaEtaria;

    @Enumerated(EnumType.STRING)
    @Column (nullable = false, length = 20)
    private Vinculo vinculo;

    @Column (nullable = false)
    private LocalDate dataNascimento;

    @Column (nullable = false, length = 40)
    private String nome;

    @Column (nullable = false, length = 40)
    private String nomeResponsavel;

    @Column (nullable = false, length = 20)
    private String telefone;

    @OneToOne(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    private Endereco endereco;
}
