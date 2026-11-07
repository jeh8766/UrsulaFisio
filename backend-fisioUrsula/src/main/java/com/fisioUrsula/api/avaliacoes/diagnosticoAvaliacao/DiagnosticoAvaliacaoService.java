package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiagnosticoAvaliacaoService {

    private final DiagnosticoAvaliacaoRepository diagnosticoAvaliacaoRepository;

    @Transactional
    public void ativar(Long id) {
        buscarEntidade(id).ativar();
    }

    @Transactional
    public void inativar(Long id) {
        buscarEntidade(id).inativar();
    }

    private DiagnosticoAvaliacao buscarEntidade(Long id) {
        return diagnosticoAvaliacaoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Diagnóstico da avaliação não encontrado."));
    }
}