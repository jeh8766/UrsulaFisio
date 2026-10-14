package com.fisioUrsula.api.pacientes.paciente;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.pacientes.paciente.dtos.CadastarPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteRequestDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.utils.TelefoneUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    @Transactional
    public CadastarPacienteResponseDTO cadastrarPaciente(CadastrarPacienteRequestDTO dto) {

        if (pacienteRepository.existsByNomeIgnoreCaseAndTelefone(dto.nome().trim(),
                TelefoneUtil.normalizarTelefone(dto.telefone()))) {
            throw new RegistroDuplicadoException("Já existe um paciente cadastrado com esse nome e telefone.");
        }

        Paciente paciente = new Paciente(dto);
        Paciente pacienteSalvo = pacienteRepository.save(paciente);
        return new CadastarPacienteResponseDTO(pacienteSalvo);
    }
    @Transactional
    public List<CadastarPacienteResponseDTO> listarTodosPacientes() {

        return pacienteRepository.findAll()
                .stream()
                .map(CadastarPacienteResponseDTO::new)
                .toList();
    }
}