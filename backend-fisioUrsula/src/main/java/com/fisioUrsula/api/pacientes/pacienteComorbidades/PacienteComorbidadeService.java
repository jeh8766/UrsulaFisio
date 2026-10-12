package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;
import com.fisioUrsula.api.pacientes.comorbidades.ComorbidadeRepository;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeResponseDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PacienteComorbidadeService {

    private final PacienteComorbidadeRepository pacienteComorbidadeRepository;
    private final ComorbidadeRepository comorbidadeRepository;

    @Transactional
    public CadastrarComorbidadeResponseDTO cadastrarComorbidade(CadastrarComorbidadeRequestDTO dto) {
        if (comorbidadeRepository.findByNomeIgnoreCase(dto.nome()).isPresent()) {
            throw new RegistroDuplicadoException("Já existe uma comorbidade cadastrada com esse nome");
        }
        if (dto.codigoCID() != null && comorbidadeRepository.existsByCodigoCID(dto.codigoCID())) {
            throw new RegistroDuplicadoException("Já existe uma comorbidade cadastrada com esse CID");
        }
        Comorbidade comorbidade = new Comorbidade(dto);
        Comorbidade comorbidadeSalva = comorbidadeRepository.save(comorbidade);
        return new CadastrarComorbidadeResponseDTO(comorbidadeSalva);
    }

}
