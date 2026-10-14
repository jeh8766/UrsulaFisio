package com.fisioUrsula.api.shared.exceptions;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RegistroDuplicadoException.class)
    public ResponseEntity<String> registroDuplicado(RegistroDuplicadoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(RegistroNaoEncontradoException.class)
    public ResponseEntity<String> RegistroNaoEncontrado(RegistroNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> tratarDadosInvalidos(MethodArgumentNotValidException ex) {
        // Quero deixar com o aviso, não quero ignorar...
        String mensagem = ex.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage).findFirst()
                .orElse("Dados inválidos.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensagem);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> tratarViolacaoIntegridade(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensagem", "Não foi possível realizar o agendamento devido a um conflito nos dados."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> tratarArgumentoInvalido(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> entidadeNaoEncontrada(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
