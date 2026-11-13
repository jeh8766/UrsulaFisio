package com.fisioUrsula.api.avaliacoes.diagnosticos;

import com.fisioUrsula.api.avaliacoes.diagnosticos.dtos.*;
import com.fisioUrsula.api.shared.exceptions.RegistroDuplicadoException;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiagnosticoService {

    private final DiagnosticoRepository diagnosticoRepository;

    @Transactional
    public CriarDiagnosticoResponseDTO criarDiagnostico(CriarDiagnosticoRequestDTO dto) {

        if (diagnosticoRepository.findByNomeIgnoreCase(dto.nome()).isPresent()) {
            throw new RegistroDuplicadoException("Ja existe um diagnostico com esse nome!");
        }

        Diagnostico diagnostico = new Diagnostico(dto);
        Diagnostico diagnosticoSalvo = diagnosticoRepository.save(diagnostico);

        return new CriarDiagnosticoResponseDTO(diagnosticoSalvo);

    }

    @Transactional
    public List<ListarDiagnosticoResponseDTO> listarDiagnosticos(String nome) {

        List<Diagnostico> diagnosticos;

        if (nome == null || nome.isBlank()){
            diagnosticos = diagnosticoRepository.findAll();
        }else {
            diagnosticos = diagnosticoRepository.findByNomeContainingIgnoreCase(nome.trim());
        }

        return diagnosticos.stream()
                .map(ListarDiagnosticoResponseDTO::new)
                .toList();
    }

    @Transactional
    public ListarDiagnosticoResponseDTO buscarDiagnosticoPorId(Long id) {

        Diagnostico diagnostico = diagnosticoRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Não existe diagnostico com esse id!"));

        return new ListarDiagnosticoResponseDTO(diagnostico);
    }

    @Transactional
    public DetalharDiagnosticoResponseDTO atualizarDiagnostico(Long id, AtualizarDiagnosticoRequestDTO dto) {

        Diagnostico diagnostico = diagnosticoRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Não existe diagnostico com esse id!"));

        if (dto.nome() != null){
            diagnostico.setNome(dto.nome());
        }
        if (dto.descricao() != null){
            diagnostico.setDescricao(dto.descricao());
        }

        diagnosticoRepository.save(diagnostico);

        return new DetalharDiagnosticoResponseDTO(diagnostico);

    }


}
