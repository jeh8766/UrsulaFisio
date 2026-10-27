package com.fisioUrsula.api.financeiro.despesas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fisioUrsula.api.financeiro.despesas.dtos.CadastrarDespesaRequestDTO;
import com.fisioUrsula.api.financeiro.despesas.dtos.DetalharDespesaResponseDTO;
import com.fisioUrsula.api.shared.enums.CategoriaDespesa;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DespesaService {

    private final DespesaRepository despesaRepository;

    @Transactional
    public DetalharDespesaResponseDTO registrarDespesa(CadastrarDespesaRequestDTO dto) {
        Despesa despesa = new Despesa(dto);
        return new DetalharDespesaResponseDTO(despesaRepository.save(despesa));
    }

    @Transactional(readOnly = true)
    public List<DetalharDespesaResponseDTO> listarDespesas() {
        return listarDespesasPorFiltro(null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<DetalharDespesaResponseDTO> listarDespesasPorPeriodo(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);
        return listarDespesasPorFiltro(null, inicio, fim, null);
    }

    @Transactional(readOnly = true)
    public List<DetalharDespesaResponseDTO> listarDespesasPorCategoria(CategoriaDespesa categoria) {
        return listarDespesasPorFiltro(categoria, null, null, null);
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotalDespesasPorPeriodo(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);
        return calcularTotalPorFiltro(null, inicio, fim);
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotalDespesasPorCategoria(CategoriaDespesa categoria) {
        return calcularTotalPorFiltro(categoria, null, null);
    }

    private List<DetalharDespesaResponseDTO> listarDespesasPorFiltro(CategoriaDespesa categoria, LocalDate inicio,
                                                                      LocalDate fim, String busca) {
        validarPeriodo(inicio, fim);
        String termo = (busca == null || busca.isBlank()) ? null : busca.trim();
        return despesaRepository.filtrar(categoria, inicio, fim, termo)
                .stream()
                .map(DetalharDespesaResponseDTO::new)
                .toList();
    }

    private BigDecimal calcularTotalPorFiltro(CategoriaDespesa categoria, LocalDate inicio, LocalDate fim) {
        BigDecimal total = despesaRepository.somarValores(categoria, inicio, fim);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public DetalharDespesaResponseDTO buscarPorId(Long id) {
        return new DetalharDespesaResponseDTO(buscarEntidade(id));
    }

    @Transactional
    public DetalharDespesaResponseDTO atualizar(Long id, CadastrarDespesaRequestDTO dto) {
        Despesa despesa = buscarEntidade(id);
        despesa.atualizar(dto);
        return new DetalharDespesaResponseDTO(despesaRepository.save(despesa));
    }

    @Transactional
    public void excluirDespesa(Long id) {
        Despesa despesa = buscarEntidade(id);
        despesaRepository.delete(despesa);
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser depois da data final.");
        }
    }

    private Despesa buscarEntidade(Long id) {
        return despesaRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Despesa não encontrada."));
    }
}