package com.fisioUrsula.api.avaliacoes.diagnosticos;

import java.util.List;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.DiagnosticoAvaliacao;

import com.fisioUrsula.api.avaliacoes.diagnosticos.dtos.CriarDiagnosticoRequestDTO;
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
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 40)
    private String nome;

    @Column(length = 60)
    private String descricao;

    @OneToMany(mappedBy = "diagnostico")
    private List<DiagnosticoAvaliacao> diagnosticos;

    public Diagnostico (CriarDiagnosticoRequestDTO dto){
        this.nome = dto.nome();
        this.descricao = dto.descricao();
    }
}
