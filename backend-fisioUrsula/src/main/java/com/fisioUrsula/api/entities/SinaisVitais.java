package com.fisioUrsula.api.entities;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "sinais_vitais")
public class SinaisVitais implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pressaoArterial;
    private Double saturacao;
    private int frequenciaCardiaca;

    public SinaisVitais (){

    }

    public SinaisVitais(Long id, String pressaoArterial, Double saturacao, int frequenciaCardiaca) {
        this.id = id;
        this.pressaoArterial = pressaoArterial;
        this.saturacao = saturacao;
        this.frequenciaCardiaca = frequenciaCardiaca;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPressaoArterial() {
        return pressaoArterial;
    }

    public void setPressaoArterial(String pressaoArterial) {
        this.pressaoArterial = pressaoArterial;
    }

    public Double getSaturacao() {
        return saturacao;
    }

    public void setSaturacao(Double saturacao) {
        this.saturacao = saturacao;
    }

    public int getFrequenciaCardiaca() {
        return frequenciaCardiaca;
    }

    public void setFrequenciaCardiaca(int frequenciaCardiaca) {
        this.frequenciaCardiaca = frequenciaCardiaca;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        SinaisVitais that = (SinaisVitais) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
