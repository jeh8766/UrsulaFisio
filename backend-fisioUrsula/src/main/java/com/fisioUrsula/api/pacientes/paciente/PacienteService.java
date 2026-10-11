package com.fisioUrsula.api.pacientes.paciente;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.pacientes.paciente.dtos.CadastarPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteRequestDTO;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    @Transactional
    public CadastarPacienteResponseDTO cadastrarPaciente(CadastrarPacienteRequestDTO dto) {
        Paciente paciente = new Paciente();
        Paciente pacienteSalvo = pacienteRepository.save(paciente);
        return new CadastarPacienteResponseDTO(pacienteSalvo);
    }
}