package com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao;

import java.util.List;

import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.DetalharDiagnosticoAvaliacaoResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.avaliacao.AvaliacaoRepository;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtribuirDiagnosticoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.AtualizarDiagnosticoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticoAvaliacao.dto.ListarDiagnosticosAvaliacaoResponseDTO;
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
    public DetalharDiagnosticoAvaliacaoResponseDTO atribuirDiagnosticoAvaliacao(AtribuirDiagnosticoAvaliacaoRequestDTO dto) {

        Avaliacao avaliacao = avaliacaoRepository.findById(dto.avaliacaoId())
                .orElseThrow(() -> new RegistroNaoEncontradoException("Avaliação não encontrada."));

        Diagnostico diagnostico = diagnosticoRepository.findById(dto.diagnosticoId())
                .orElseThrow(() -> new RegistroNaoEncontradoException("Diagnóstico não encontrado."));


        if (!diagnostico.isAtivo()){
            throw new IllegalStateException("Não pode atribuir um diagnostico inativo!");
        }

        var jaAssociada = diagnosticoAvaliacaoRepository.findByAvaliacao_IdAndDiagnostico_Id(dto.avaliacaoId(), dto.diagnosticoId());

        if (jaAssociada.isPresent()){

            DiagnosticoAvaliacao diagnosticoAvaliacao = jaAssociada.get();

            if (diagnosticoAvaliacao.getStatus() == StatusDiagnostico.ATIVO){
                throw new IllegalStateException("Esse dianostico avaliacao ja esta atribuido!");
            }

            diagnosticoAvaliacao.setStatus(StatusDiagnostico.ATIVO);

            DiagnosticoAvaliacao diagnosticoAvaliacaoSalvo = diagnosticoAvaliacaoRepository.save(diagnosticoAvaliacao);

            return new DetalharDiagnosticoAvaliacaoResponseDTO(diagnosticoAvaliacaoSalvo);
        }

        DiagnosticoAvaliacao diagnosticoAvaliacao = new DiagnosticoAvaliacao();

        diagnosticoAvaliacao.setDataDiagnostico(dto.dataDiagnostico());
        diagnosticoAvaliacao.setStatus(StatusDiagnostico.ATIVO);
        diagnosticoAvaliacao.setObservacao(dto.observacao());
        diagnosticoAvaliacao.setDiagnostico(diagnostico);
        diagnosticoAvaliacao.setAvaliacao(avaliacao);

        DiagnosticoAvaliacao diagnosticoAvaliacaosalvo = diagnosticoAvaliacaoRepository.save(diagnosticoAvaliacao);

        return new DetalharDiagnosticoAvaliacaoResponseDTO(diagnosticoAvaliacaosalvo);
    }

    @Transactional
    public DetalharDiagnosticoAvaliacaoResponseDTO atualizarDiagnosticoAvaliacao(Long id, AtualizarDiagnosticoAvaliacaoRequestDTO dto) {

        DiagnosticoAvaliacao diagnosticoAvaliacao = diagnosticoAvaliacaoRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("nao existe diagnostico avaliaçao com esse id!"));

        if (dto.dataDiagnostico() != null){
            diagnosticoAvaliacao.setDataDiagnostico(dto.dataDiagnostico());
        }
        if (dto.observacao() != null){
            diagnosticoAvaliacao.setObservacao(dto.observacao());
        }

        diagnosticoAvaliacaoRepository.save(diagnosticoAvaliacao);

        return new DetalharDiagnosticoAvaliacaoResponseDTO(diagnosticoAvaliacao);
    }

    @Transactional(readOnly = true)
    public List<ListarDiagnosticosAvaliacaoResponseDTO> listarDiagnosticosDaAvaliacao(Long avaliacaoId) {

        avaliacaoRepository.findById(avaliacaoId).orElseThrow(() -> new RegistroNaoEncontradoException("Não existe avaliaçao com esse id"));

        return diagnosticoAvaliacaoRepository.findByAvaliacaoId(avaliacaoId)
                .stream()
                .map(ListarDiagnosticosAvaliacaoResponseDTO::new)
                .toList();
    }

    @Transactional
    public void inativarDiagnosticoAvaliacao(Long id) {

        DiagnosticoAvaliacao diagnosticoAvaliacao = diagnosticoAvaliacaoRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("nao existe diagnostico avaliaçao com esse id!"));

        if (diagnosticoAvaliacao.getStatus() == StatusDiagnostico.INATIVO) {
            throw new IllegalStateException("Diagnostico avaliaçao ja esta inativo!");
        }

        diagnosticoAvaliacao.setStatus(StatusDiagnostico.INATIVO);
        diagnosticoAvaliacaoRepository.save(diagnosticoAvaliacao);
    }

}