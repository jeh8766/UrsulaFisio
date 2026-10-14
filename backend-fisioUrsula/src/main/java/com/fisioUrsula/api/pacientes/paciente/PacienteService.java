package com.fisioUrsula.api.pacientes.paciente;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fisioUrsula.api.pacientes.paciente.dtos.CadastarPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteRequestDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.DetalharPacienteResponseDTO;
import com.fisioUrsula.api.pacientes.paciente.dtos.ListarPacienteResponseDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import com.fisioUrsula.api.shared.utils.TelefoneUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

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
    public List<ListarPacienteResponseDTO> listar(String nome, FaixaEtaria faixaEtaria,
                                                  Long comorbidadeId, boolean ativo) {
        return pacienteRepository
                .findAll(PacienteSpecification.filtrar(nome, faixaEtaria, comorbidadeId, ativo),
                        Sort.by("nome").ascending())
                .stream()
                .map(ListarPacienteResponseDTO::new)
                .toList();
    }

    @Transactional
    public DetalharPacienteResponseDTO buscarPorId(Long id) {
        return new DetalharPacienteResponseDTO(buscarEntidade(id));
    }

    @Transactional
    public DetalharPacienteResponseDTO atualizar(Long id, CadastrarPacienteRequestDTO dto) {
        Paciente paciente = buscarEntidade(id);

        String nome = dto.nome().trim();
        String telefone = TelefoneUtil.normalizarTelefone(dto.telefone());

        if (pacienteRepository.existsByNomeIgnoreCaseAndTelefoneAndIdNot(nome, telefone, id)) {
            throw new RegistroDuplicadoException("Já existe um paciente cadastrado com esse nome e telefone.");
        }

        paciente.atualizar(dto);
        return new DetalharPacienteResponseDTO(pacienteRepository.save(paciente));
    }

    @Transactional
    public void inativar(Long id) {
        Paciente paciente = buscarEntidade(id);
        paciente.setAtivo(false);
        pacienteRepository.save(paciente);
    }

    private Paciente buscarEntidade(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Paciente não encontrado."));
    }
}