package com.fisioUrsula.api.pacientes.endereco;

import java.io.Serializable;

import com.fisioUrsula.api.pacientes.paciente.Paciente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "enderecos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Endereco implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne
    @JoinColumn(name = "id_paciente",nullable = false,unique = true)
    private Paciente paciente;

    @Column(nullable = false, length = 9)
    private String cep;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private Estado estado;

    @Column(nullable = false, length = 30)
    private String cidade;

    @Column(nullable = false, length = 40)
    private String bairro;

    @Column(nullable = false, length = 30)
    private String rua;

    @Column(nullable = false, length = 5)
    private int numero;

    @Column(nullable = false, length = 40)
    private String complemento;

}
