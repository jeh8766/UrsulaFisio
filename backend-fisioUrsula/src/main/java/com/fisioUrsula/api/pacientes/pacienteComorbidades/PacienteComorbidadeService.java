package com.fisioUrsula.api.pacientes.pacienteComorbidades;


import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtualizarPacienteComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.DetalharPacienteComorbidadeResponseDTO;
import com.fisioUrsula.api.shared.enums.StatusDiagnostico;
import org.springframework.stereotype.Service;

import com.fisioUrsula.api.pacientes.comorbidades.Comorbidade;
import com.fisioUrsula.api.pacientes.comorbidades.ComorbidadeRepository;
import com.fisioUrsula.api.pacientes.paciente.Paciente;
import com.fisioUrsula.api.pacientes.paciente.PacienteRepository;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirPacienteComorbidadeRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.dtos.AtribuirPacienteComorbidadeResponseDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteComorbidadeService {

    private final PacienteRepository pacienteRepository;
    private final PacienteComorbidadeRepository pacienteComorbidadeRepository;
    private final ComorbidadeRepository comorbidadeRepository;


    @Transactional
    public AtribuirPacienteComorbidadeResponseDTO atribuirComorbidadePaciente(Long pacienteId, AtribuirPacienteComorbidadeRequestDTO dto) {

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Paciente não encontrado."));

        Comorbidade comorbidade = comorbidadeRepository.findById(dto.comorbidadeId())
                .orElseThrow(() -> new RegistroNaoEncontradoException("Comorbidade não encontrada."));

        if (!comorbidade.isAtivo()) {
            throw new IllegalStateException("Não é possível associar uma comorbidade que está inativa!");
        }

        var jaAssociada = pacienteComorbidadeRepository.findByPaciente_IdAndComorbidade_Id(pacienteId,
                dto.comorbidadeId());

        if (jaAssociada.isPresent()) {

            PacienteComorbidade pacienteComorbidade = jaAssociada.get();

            if (pacienteComorbidade.getStatusDiagnostico() == StatusDiagnostico.ATIVO){
                throw new RegistroDuplicadoException("Essa comorbidade ja esta associada ao paciente!");
            }


            pacienteComorbidade.setStatusDiagnostico(StatusDiagnostico.ATIVO);


            PacienteComorbidade pacienteComorbidadeSalvo = pacienteComorbidadeRepository.save(pacienteComorbidade);

            return new AtribuirPacienteComorbidadeResponseDTO(pacienteComorbidadeSalvo);
        }



        PacienteComorbidade pacienteComorbidade = new PacienteComorbidade();
        pacienteComorbidade.setPaciente(paciente);
        pacienteComorbidade.setComorbidade(comorbidade);
        pacienteComorbidade.setDataDiagnostico(dto.dataDiagnostico());
        pacienteComorbidade.setObservacao(dto.observacao());
        pacienteComorbidade.setStatusDiagnostico(StatusDiagnostico.ATIVO);

        PacienteComorbidade pacienteComorbidadeSalvo = pacienteComorbidadeRepository.save(pacienteComorbidade);

        return new AtribuirPacienteComorbidadeResponseDTO(pacienteComorbidadeSalvo);
    }

    public List<DetalharPacienteComorbidadeResponseDTO> listarComorbidadesPorPaciente(Long pacienteId) {

        pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Paciente não encontrado."));

        return pacienteComorbidadeRepository.findByPaciente_id(pacienteId)
                .stream()
                .map(DetalharPacienteComorbidadeResponseDTO::new)
                .toList();

    }

    @Transactional
    public DetalharPacienteComorbidadeResponseDTO atualizarPacienteComorbidade(Long id, AtualizarPacienteComorbidadeRequestDTO dto){

        PacienteComorbidade pacienteComorbidade = pacienteComorbidadeRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Id de paciente comorbidade não existe!"));

        if (dto.dataDiagnostico() != null){
            pacienteComorbidade.setDataDiagnostico(dto.dataDiagnostico());
        }

        if (dto.observacao() != null){
            pacienteComorbidade.setObservacao(dto.observacao());
        }

        pacienteComorbidadeRepository.save(pacienteComorbidade);

        return new DetalharPacienteComorbidadeResponseDTO(pacienteComorbidade);
    }

    public void inativarPacienteComorbidade(Long id){

        PacienteComorbidade pacienteComorbidade = pacienteComorbidadeRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Id de paciente comorbidade não existe!"));

        if (pacienteComorbidade.getStatusDiagnostico() == StatusDiagnostico.INATIVO){
            throw new IllegalStateException("paciente comorbidade ja esta inativo!");
        }

        pacienteComorbidade.setStatusDiagnostico(StatusDiagnostico.INATIVO);
        pacienteComorbidadeRepository.save(pacienteComorbidade);
    }
}
