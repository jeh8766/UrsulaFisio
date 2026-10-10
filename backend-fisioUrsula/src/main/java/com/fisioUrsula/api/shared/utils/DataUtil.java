package com.fisioUrsula.api.shared.utils;

import java.time.LocalDate;
import java.time.Period;

import com.fisioUrsula.api.pacientes.paciente.FaixaEtaria;

public class DataUtil {

    public static Integer calcularIdade(LocalDate dataNascimento) {
        if (dataNascimento.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data de nascimento não pode estar no futuro.");
        }
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }

    public static FaixaEtaria atribuirFaixaEtaria(LocalDate dataNascimento) {
        int idade = calcularIdade(dataNascimento);
        if (idade < 18)
            return FaixaEtaria.PEDIATRICO;
        if (idade <= 59)
            return FaixaEtaria.ADULTO;
        return FaixaEtaria.IDOSO;
    }
}
