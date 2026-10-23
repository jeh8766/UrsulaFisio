package com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.Exercicio;
import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.ExercicioRepository;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos.AdicionarExercicioAoPlanoRequestDTO;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos.AtualizarObservacaoPlanoExercicioRequestDTO;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoExercicios.dtos.DetalharPlanoExercicioResponseDTO;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento.PlanoTratamento;
import com.fisioUrsula.api.avaliacoes.planoTratamento.planoTratamento.PlanoTratamentoRepository;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlanoExercicioService {

    private final PlanoExercicioRepository planoExercicioRepository;
    private final PlanoTratamentoRepository planoTratamentoRepository;
    private final ExercicioRepository exercicioRepository;

    @Transactional
    public DetalharPlanoExercicioResponseDTO adicionarExercicioAoPlano(Long planoId,
                                                                       AdicionarExercicioAoPlanoRequestDTO dto) {
        PlanoTratamento plano = buscarPlano(planoId);
        Exercicio exercicio = exercicioRepository.findById(dto.exercicioId())
                .orElseThrow(() -> new RegistroNaoEncontradoException("Exercício não encontrado."));

        if (!exercicio.isAtivo()) {
            throw new IllegalArgumentException("Não é possível adicionar um exercício inativo ao plano.");
        }
        if (planoExercicioRepository.existsByPlanoTratamentoIdAndExercicioId(planoId, exercicio.getId())) {
            throw new RegistroDuplicadoException("Esse exercício já está no plano de tratamento.");
        }

        PlanoExercicio planoExercicio = new PlanoExercicio();
        planoExercicio.setPlanoTratamento(plano);
        planoExercicio.setExercicio(exercicio);
        planoExercicio.setObservacao(normalizar(dto.observacao()));
        return new DetalharPlanoExercicioResponseDTO(planoExercicioRepository.save(planoExercicio));
    }

    @Transactional(readOnly = true)
    public List<DetalharPlanoExercicioResponseDTO> listarExerciciosDoPlano(Long planoId) {
        buscarPlano(planoId);
        return planoExercicioRepository.findByPlanoTratamentoIdOrderByExercicioNomeAsc(planoId)
                .stream()
                .map(DetalharPlanoExercicioResponseDTO::new)
                .toList();
    }

    @Transactional
    public DetalharPlanoExercicioResponseDTO atualizarObservacao(Long planoId, Long id,
                                                                 AtualizarObservacaoPlanoExercicioRequestDTO dto) {
        PlanoExercicio planoExercicio = buscarItem(planoId, id);
        planoExercicio.setObservacao(normalizar(dto.observacao()));
        return new DetalharPlanoExercicioResponseDTO(planoExercicio);
    }

    @Transactional
    public void removerExercicioDoPlano(Long planoId, Long id) {
        PlanoExercicio planoExercicio = buscarItem(planoId, id);
        planoExercicioRepository.delete(planoExercicio);
    }

    private PlanoTratamento buscarPlano(Long planoId) {
        return planoTratamentoRepository.findById(planoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Plano de tratamento não encontrado."));
    }

    private PlanoExercicio buscarItem(Long planoId, Long id) {
        return planoExercicioRepository.findByIdAndPlanoTratamentoId(id, planoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Exercício não encontrado neste plano."));
    }

    private String normalizar(String observacao) {
        return (observacao == null || observacao.isBlank()) ? null : observacao.trim();
    }
}