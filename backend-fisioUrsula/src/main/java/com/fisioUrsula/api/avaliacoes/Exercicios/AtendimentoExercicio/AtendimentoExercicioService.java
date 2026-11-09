package com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.atendimentos.atendimento.AtendimentoRepository;
import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.dtos.AtribuirAtendimentoExercicioResponseDTO;
import com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio.dtos.DetalharAtendimentoExercicioResponseDTO;
import com.fisioUrsula.api.avaliacoes.Exercicios.exercicios.Exercicio;
import com.fisioUrsula.api.avaliacoes.Exercicios.exercicios.ExercicioRepository;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AtendimentoExercicioService {

    public final AtendimentoExercicioRepository atendimentoExercicioRepository;
    public final ExercicioRepository exercicioRepository;
    public final AtendimentoRepository atendimentoRepository;

    @Transactional
    public AtribuirAtendimentoExercicioResponseDTO atribuirAtendimentoExercicio(Long atendimentoId, Long exercicioId) {

        Atendimento atendimento = atendimentoRepository.findById(atendimentoId).orElseThrow(() -> new RegistroNaoEncontradoException("Atendimento com esse id indisponivel!"));
        Exercicio exercicio = exercicioRepository.findById(exercicioId).orElseThrow(() -> new RegistroNaoEncontradoException("Exercicio com esse id não encontrado"));

        if (!exercicio.isAtivo()) {
            throw new IllegalStateException("Não se pode atribuir exercicio inativos!");
        }

        if (atendimentoExercicioRepository.existsByAtendimento_IdAndExercicio_Id(atendimentoId, exercicioId)) {
            throw new RegistroDuplicadoException("Esse exercício já foi adicionado ao atendimento.");
        }
        AtendimentoExercicio atendimentoExercicio = new AtendimentoExercicio();

        atendimentoExercicio.setAtendimento(atendimento);
        atendimentoExercicio.setExercicio(exercicio);

        atendimentoExercicioRepository.save(atendimentoExercicio);

        return new AtribuirAtendimentoExercicioResponseDTO(atendimentoExercicio);
    }

    @Transactional
    public List<DetalharAtendimentoExercicioResponseDTO> listarExerciciosPorAtendimento(Long atendimentoId) {

        atendimentoRepository.findById(atendimentoId).orElseThrow(() -> new RegistroNaoEncontradoException("Atendimento com esse id indisponivel!"));

        return atendimentoExercicioRepository.findByAtendimento_Id(atendimentoId)
                .stream()
                .map(DetalharAtendimentoExercicioResponseDTO::new)
                .toList();
    }

    @Transactional
    public AtribuirAtendimentoExercicioResponseDTO atualizarExercicioDoAtendimento(Long id, Long novoExercicioId) {

        AtendimentoExercicio atendimentoExercicio = atendimentoExercicioRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Não existe atendimento exercicio com esse id!"));

        Exercicio novoExercicio = exercicioRepository.findById(novoExercicioId).orElseThrow(() -> new RegistroNaoEncontradoException("Exercicio com esse id não encontrado"));

        if (!novoExercicio.isAtivo()) {
            throw new IllegalStateException("Não se pode atribuir exercicios inativos!");
        }

        if (atendimentoExercicioRepository.existsByAtendimento_IdAndExercicio_IdAndIdNot(atendimentoExercicio.getAtendimento().getId(), novoExercicioId, id)) {
            throw new RegistroDuplicadoException("Esse exercício já foi adicionado ao atendimento.");
        }

        atendimentoExercicio.setExercicio(novoExercicio);
        atendimentoExercicioRepository.save(atendimentoExercicio);

        return new AtribuirAtendimentoExercicioResponseDTO(atendimentoExercicio);


    }

    @Transactional
    public void removerExercicioDoAtendimento(Long id) {

        AtendimentoExercicio atendimentoExercicio = atendimentoExercicioRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Não existe atendimento exercicio com esse id!"));


        atendimentoExercicioRepository.delete(atendimentoExercicio);
    }


}
