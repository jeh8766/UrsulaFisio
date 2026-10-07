package com.fisioUrsula.api.avaliacoes.diagnosticos;

import java.util.List;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.DiagnosticoAvaliacao;

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
@Table(name = "diagnosticos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String nome;

    @Column(nullable = false, length = 60)
    private String descricao;

    @Column(nullable = false, length = 6)
    private String codigoCID;

    @OneToMany(mappedBy = "diagnostico")
    private List<DiagnosticoAvaliacao> diagnosticos;

}
