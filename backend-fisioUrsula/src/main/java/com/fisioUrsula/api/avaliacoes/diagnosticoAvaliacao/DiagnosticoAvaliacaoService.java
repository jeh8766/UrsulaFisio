package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.avaliacao.AvaliacaoRepository;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtribuirDiagnosticoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtualizarDiagnosticoDaAvaliacaoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.ListarDiagnosticosDaAvaliacaoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticos.Diagnostico;
import com.fisioUrsula.api.avaliacoes.diagnosticos.DiagnosticoRepository;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiagnosticoAvaliacaoService {

    private final DiagnosticoAvaliacaoRepository diagnosticoAvaliacaoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final DiagnosticoRepository diagnosticoRepository;

    @Transactional
    public void atribuirDiagnostico(AtribuirDiagnosticoDTO dto) {

        Avaliacao avaliacao = avaliacaoRepository.findById(dto.avaliacaoId())
                .orElseThrow(() -> new RegistroNaoEncontradoException("Avaliação não encontrada."));

        Diagnostico diagnostico = diagnosticoRepository.findById(dto.diagnosticoId())
                .orElseThrow(() -> new RegistroNaoEncontradoException("Diagnóstico não encontrado."));



        diagnosticoAvaliacaoRepository.save(new DiagnosticoAvaliacao(dto, avaliacao, diagnostico));
    }

    @Transactional
    public void removerDiagnosticoDeAvaliacao(Long id) {
        diagnosticoAvaliacaoRepository.delete(buscarEntidade(id));
    }

    @Transactional
    public void atualizarDiagnosticoDaAvaliacao(Long id, AtualizarDiagnosticoDaAvaliacaoDTO dto) {
        buscarEntidade(id).atualizar(dto);
    }

    @Transactional(readOnly = true)
    public List<ListarDiagnosticosDaAvaliacaoDTO> listarDiagnosticosDaAvaliacao(Long avaliacaoId) {
        if (!avaliacaoRepository.existsById(avaliacaoId)) {
            throw new RegistroNaoEncontradoException("Avaliação não encontrada.");
        }
        return diagnosticoAvaliacaoRepository.findByAvaliacaoId(avaliacaoId)
                .stream()
                .map(ListarDiagnosticosDaAvaliacaoDTO::new)
                .toList();
    }

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