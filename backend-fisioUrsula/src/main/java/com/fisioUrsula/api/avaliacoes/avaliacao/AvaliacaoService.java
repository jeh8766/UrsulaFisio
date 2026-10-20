package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.avaliacoes.avaliacao.dto.AtualizarAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.avaliacao.dto.AtualizarAvaliacaoResponseDTO;
import com.fisioUrsula.api.avaliacoes.avaliacao.dto.AtualizarStatusAtendimentoAvaliacaoRequestDTO;
import com.fisioUrsula.api.avaliacoes.avaliacao.dto.ListarAvaliacoesResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;

    @Transactional
    public AtualizarAvaliacaoResponseDTO atualizarAvaliacao(Long id, AtualizarAvaliacaoRequestDTO dto) {

        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Avaliação não encontrada."));

        avaliacao.setQueixaPrincipal(dto.queixaPrincipal());
        avaliacao.setObservacao(dto.observacao());
        avaliacao.setValor(dto.valor());
        avaliacao.setStatusPagamento(dto.statusPagamento());

        return new AtualizarAvaliacaoResponseDTO(avaliacao);

    }

    @Transactional
    public void atualizarStatusAtendimento(Long id, AtualizarStatusAtendimentoAvaliacaoRequestDTO dto) {

        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Avaliação não encontrada."));

        // validar com demandante, se um status atendido pode ser cancelado, reagendado
        // ou outro
        if (avaliacao.getStatusAtendimento() == StatusAtendimento.ATENDIDO) {
            throw new IllegalStateException("Não é possível alterar o status de uma avaliação já atendida.");
        }

        avaliacao.setStatusAtendimento(dto.statusAtendimento());
    }

    @Transactional(readOnly = true)
    public List<ListarAvaliacoesResponseDTO> listarAvaliacoes() {
        return avaliacaoRepository.findAll().stream().map(ListarAvaliacoesResponseDTO::new).toList();
    }
}