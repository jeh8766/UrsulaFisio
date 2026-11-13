package com.fisioUrsula.api.avaliacoes.diagnosticos;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.avaliacoes.diagnosticos.dto.AtualizarDiagnosticoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticos.dto.CriarDiagnosticoDTO;
import com.fisioUrsula.api.avaliacoes.diagnosticos.dto.ListarDiagnosticosDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiagnosticoService {

    private final DiagnosticoRepository diagnosticoRepository;

    @Transactional
    public void criarDiagnostico(CriarDiagnosticoDTO dto) {
        diagnosticoRepository.save(new Diagnostico(dto));
    }

    @Transactional(readOnly = true)
    public List<ListarDiagnosticosDTO> listarDiagnosticos() {
        return diagnosticoRepository.findAll()
                .stream()
                .map(ListarDiagnosticosDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ListarDiagnosticosDTO buscarDiagnosticoPorId(Long id) {
        return new ListarDiagnosticosDTO(buscarEntidade(id));
    }

    @Transactional
    public void atualizarDiagnostico(Long id, AtualizarDiagnosticoDTO dto) {
        buscarEntidade(id).atualizar(dto);
    }

    private Diagnostico buscarEntidade(Long id) {
        return diagnosticoRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Diagnóstico não encontrado."));
    }
}