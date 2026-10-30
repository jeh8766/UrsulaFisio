package com.fisioUrsula.api.pacientes.pacienteComorbidades;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;
import com.fisioUrsula.api.pacientes.comorbidades.ComorbidadeRepository;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirComorbidadeResponseDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.CadastrarComorbidadeResponseDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import java.util.List;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PacienteComorbidadeService {

    private final PacienteRepository pacienteRepository;
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
    public List<CadastrarComorbidadeResponseDTO> listarComorbidades(String nome) {

        List<Comorbidade> comorbidades;

        if (nome == null || nome.isBlank()) {
            comorbidades = comorbidadeRepository.findAll();
        } else {
            comorbidades = comorbidadeRepository
                    .findByNomeContainingIgnoreCase(nome.trim());
        }

        return comorbidades.stream()
                .map(CadastrarComorbidadeResponseDTO::new)
                .toList();
    }
    @Transactional
    public AtribuirComorbidadeResponseDTO atribuirComorbidade(Long pacienteId, AtribuirComorbidadeRequestDTO dto) {

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Paciente não encontrado."));

        Comorbidade comorbidade = comorbidadeRepository.findById(dto.comorbidadeId())
                .orElseThrow(() -> new RegistroNaoEncontradoException("Comorbidade não encontrada."));

        boolean jaAssociada = pacienteComorbidadeRepository.existsByPaciente_IdAndComorbidade_Id(pacienteId,
                dto.comorbidadeId());
        if (jaAssociada) {
            throw new RegistroDuplicadoException("Essa comorbidade já está associada ao paciente.");
        }

        PacienteComorbidade pacienteComorbidade = new PacienteComorbidade();
        pacienteComorbidade.setPaciente(paciente);
        pacienteComorbidade.setComorbidade(comorbidade);
        pacienteComorbidade.setDataDiagnostico(dto.dataDiagnostico());
        pacienteComorbidade.setObservacao(dto.observacoes());
        pacienteComorbidade.setStatusDiagnostico(dto.statusDiagnostico());

        PacienteComorbidade pacienteComorbidadeSalvo = pacienteComorbidadeRepository.save(pacienteComorbidade);

        return new AtribuirComorbidadeResponseDTO(pacienteComorbidadeSalvo);
    }
}
