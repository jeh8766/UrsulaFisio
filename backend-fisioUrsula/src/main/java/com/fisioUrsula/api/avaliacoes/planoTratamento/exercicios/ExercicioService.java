package com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.dtos.CadastrarExercicioRequestDTO;
import com.fisioUrsula.api.avaliacoes.planoTratamento.exercicios.dtos.DetalharExercicioResponseDTO;
import com.fisioUrsula.api.shared.enums.TipoExercicio;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExercicioService {

    private final ExercicioRepository exercicioRepository;

    @Transactional
    public DetalharExercicioResponseDTO cadastrarExercicio(CadastrarExercicioRequestDTO dto) {
        if (exercicioRepository.existsByNomeIgnoreCase(dto.nome().trim())) {
            throw new RegistroDuplicadoException("Já existe um exercício cadastrado com esse nome.");
        }
        Exercicio exercicio = new Exercicio(dto);
        return new DetalharExercicioResponseDTO(exercicioRepository.save(exercicio));
    }

    @Transactional(readOnly = true)
    public List<DetalharExercicioResponseDTO> listarExercicios(TipoExercicio tipo, boolean ativo) {
        return exercicioRepository.filtrar(null, tipo, ativo)
                .stream()
                .map(DetalharExercicioResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public DetalharExercicioResponseDTO buscarExercicioPorId(Long id) {
        return new DetalharExercicioResponseDTO(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public List<DetalharExercicioResponseDTO> buscarExercicioPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Informe o nome para a busca.");
        }
        return exercicioRepository.filtrar(nome.trim(), null, true)
                .stream()
                .map(DetalharExercicioResponseDTO::new)
                .toList();
    }

    @Transactional
    public DetalharExercicioResponseDTO atualizarExercicio(Long id, CadastrarExercicioRequestDTO dto) {
        Exercicio exercicio = buscarEntidade(id);
        if (exercicioRepository.existsByNomeIgnoreCaseAndIdNot(dto.nome().trim(), id)) {
            throw new RegistroDuplicadoException("Já existe um exercício cadastrado com esse nome.");
        }
        exercicio.atualizar(dto);
        return new DetalharExercicioResponseDTO(exercicioRepository.save(exercicio));
    }

    @Transactional
    public void inativarExercicio(Long id) {
        Exercicio exercicio = buscarEntidade(id);
        exercicio.setAtivo(false);
    }

    private Exercicio buscarEntidade(Long id) {
        return exercicioRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Exercício não encontrado."));
    }
    @Transactional
    public void ativarExercicio(Long id) {
            Exercicio exercicio = buscarEntidade(id);
            exercicio.setAtivo(true);
    }
}