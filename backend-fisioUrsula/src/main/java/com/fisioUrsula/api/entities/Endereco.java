package com.fisioUrsula.api.entities;

import com.fisioUrsula.api.enums.Estado;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "enderecos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor
@NoArgsConstructor
public class Endereco implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String cep;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    private String cidade;
    private String bairro;
    private String rua;
    private int numero;
    private String complemento;


}
