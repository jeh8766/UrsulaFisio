package com.fisioUrsula.api.pacientes.comorbidades;

import java.io.Serializable;
import java.util.List;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comorbidades")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Comorbidade implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 40)
    private String nome;

    @Column(nullable = false, length = 80)
    private String descricao;

    @Column(length = 6)
    private String codigoCID;

    @OneToMany(mappedBy = "comorbidade")
    private List<PacienteComorbidade> pacientes;

    
}
