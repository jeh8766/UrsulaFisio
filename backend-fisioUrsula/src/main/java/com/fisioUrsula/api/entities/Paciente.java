package com.fisioUrsula.api.entities;

import com.fisioUrsula.api.enums.FaixaEtaria;
import com.fisioUrsula.api.enums.Vinculo;
import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "pacientes")
public class Paciente implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    public Paciente(Long id, int idade, FaixaEtaria faixaEtaria, Vinculo vinculo, LocalDate dataNascimento, String nomePaciente, String nomeResponsavel, String telefone) {
        this.id = id;
        this.idade = idade;
        this.faixaEtaria = faixaEtaria;
        this.vinculo = vinculo;
        this.dataNascimento = dataNascimento;
        this.nome = nomePaciente;
        this.nomeResponsavel = nomeResponsavel;
        this.telefone = telefone;
    }

    public Paciente (){

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getIdade() {
        return idade;
    }

    public void setIdade(int idade) {
        this.idade = idade;
    }

    public FaixaEtaria getFaixaEtaria() {
        return faixaEtaria;
    }

    public void setFaixaEtaria(FaixaEtaria faixaEtaria) {
        this.faixaEtaria = faixaEtaria;
    }

    public Vinculo getVinculo() {
        return vinculo;
    }

    public void setVinculo(Vinculo vinculo) {
        this.vinculo = vinculo;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNomeResponsavel() {
        return nomeResponsavel;
    }

    public void setNomeResponsavel(String nomeResponsavel) {
        this.nomeResponsavel = nomeResponsavel;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Paciente paciente = (Paciente) o;
        return Objects.equals(id, paciente.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
