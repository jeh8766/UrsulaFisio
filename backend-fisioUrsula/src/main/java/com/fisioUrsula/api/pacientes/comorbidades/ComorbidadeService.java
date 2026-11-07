package com.fisioUrsula.api.pacientes.comorbidades;

import com.fisioUrsula.api.pacientes.comorbidades.dtos.AtualizarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.comorbidades.dtos.CadastrarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.comorbidades.dtos.CadastrarComorbidadeResponseDTO;
import com.fisioUrsula.api.pacientes.comorbidades.dtos.DetalharComorbidadeResponseDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComorbidadeService {

    private final ComorbidadeRepository comorbidadeRepository;


    @Transactional
    public CadastrarComorbidadeResponseDTO cadastrarComorbidade(CadastrarComorbidadeRequestDTO dto) {

        if (comorbidadeRepository.findByNomeIgnoreCase(dto.nome()).isPresent()) {
            throw new RegistroDuplicadoException("Já existe uma comorbidade cadastrada com esse nome");
        }


        Comorbidade comorbidade = new Comorbidade(dto);
        Comorbidade comorbidadeSalva = comorbidadeRepository.save(comorbidade);

        return new CadastrarComorbidadeResponseDTO(comorbidadeSalva);
    }

    public List<DetalharComorbidadeResponseDTO> listarComorbidadePorNome(String nome) {

        List<Comorbidade> comorbidades;

        if (nome == null || nome.isBlank()) {
            comorbidades = comorbidadeRepository.findByAtivoTrue();
        } else {
            comorbidades = comorbidadeRepository
                    .findByAtivoTrueAndNomeContainingIgnoreCase(nome.trim());
        }

        return comorbidades.stream()
                .map(DetalharComorbidadeResponseDTO::new)
                .toList();
    }

    public DetalharComorbidadeResponseDTO atualizarComorbidade(Long id, AtualizarComorbidadeRequestDTO dto) {

        Comorbidade comorbidade = comorbidadeRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Comorbidade com id não encontrada!"));

        if (dto.nome() != null) {

            if (!comorbidade.getNome().equalsIgnoreCase(dto.nome())
                    && comorbidadeRepository.findByNomeIgnoreCase(dto.nome()).isPresent()) {

                throw new RegistroDuplicadoException(
                        "Já existe uma comorbidade cadastrada com esse nome."
                );
            }

            comorbidade.setNome(dto.nome());
        }

        if (dto.descricao() != null) {
            comorbidade.setDescricao(dto.descricao());
        }

        comorbidadeRepository.save(comorbidade);

        return new DetalharComorbidadeResponseDTO(comorbidade);
    }

    public void inativarComorbidade(Long id) {

        Comorbidade comorbidade = comorbidadeRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Comorbidade com id não encontrada!"));


        if (!comorbidade.isAtivo()) {
            throw new IllegalStateException("comorbidade ja esta inativa!");
        }

        comorbidade.setAtivo(false);

        comorbidadeRepository.save(comorbidade);
    }


}
