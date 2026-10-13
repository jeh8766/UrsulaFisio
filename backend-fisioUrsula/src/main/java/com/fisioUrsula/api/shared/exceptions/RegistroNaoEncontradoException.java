package com.fisioUrsula.api.shared.exceptions;

public class RegistroNaoEncontradoException extends RuntimeException {
    public RegistroNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
