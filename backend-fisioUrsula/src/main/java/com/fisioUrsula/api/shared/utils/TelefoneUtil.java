package com.fisioUrsula.api.shared.utils;

public class TelefoneUtil {
    public static String normalizarTelefone(String telefone) {
        String numeros = telefone.replaceAll("\\D", "");

        if (numeros.length() == 11) {
            return numeros.replaceFirst("(\\d{2})(\\d{5})(\\d{4})", "($1) $2-$3");
        }

        if (numeros.length() == 10) {
            return numeros.replaceFirst("(\\d{2})(\\d{4})(\\d{4})", "($1) $2-$3");
        }
        throw new IllegalArgumentException("Telefone inválido");
    }

}
