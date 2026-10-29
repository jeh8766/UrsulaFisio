package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.atendimentos.atendimento.dtos.*;
import org.springframework.stereotype.Service;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.agendamentos.AgendamentoRepository;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitaisRepository;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AtendimentoService {

    public final AtendimentoRepository atendimentoRepository;
    public final SinaisVitaisRepository sinaisVitaisRepository;
    private final AgendamentoRepository agendamentoRepository;

    public CriarAtendimentoResponseDTO criarAtendimento(CriarAtendimentoRequestDTO criarAtendimentoRequestDTO) {

        Atendimento atendimento = new Atendimento();

        atendimento.setValor(criarAtendimentoRequestDTO.valor());
        atendimento.setTaxaDeslocamento(criarAtendimentoRequestDTO.taxaDeslocamento());
        atendimento.setStatusAtendimento(StatusAtendimento.AGENDADO);
        atendimento.setStatusPagamento(StatusPagamento.PENDENTE);

        Agendamento agendamentoAtendimento = agendamentoRepository.findById(criarAtendimentoRequestDTO.agendamentoId())
                .orElseThrow(() -> new RuntimeException("Id não existe!"));
        atendimento.setAgendamento(agendamentoAtendimento);

        if (agendamentoAtendimento.getTipoAgendamento() != TipoAgendamento.ATENDIMENTO) {
            throw new IllegalArgumentException("O agendamento informado não é do tipo atendimento.");
        }

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(criarAtendimentoRequestDTO.sinaisVitaisId())
                .orElseThrow(() -> new RuntimeException("Id de sinais vitais não existe!"));
        atendimento.setSinaisVitais(sinaisVitais);

        Atendimento atendimentoSalvo = atendimentoRepository.save(atendimento);

        CriarAtendimentoResponseDTO criarAtendimentoResponseDTO = new CriarAtendimentoResponseDTO(
                atendimentoSalvo.getId(),
                atendimentoSalvo.getIntercorrencia(),
                atendimentoSalvo.getEvolucao(),
                atendimentoSalvo.getValor(),
                atendimentoSalvo.getTaxaDeslocamento(),
                atendimentoSalvo.getStatusAtendimento(),
                atendimentoSalvo.getStatusPagamento());

        return criarAtendimentoResponseDTO;

    }

    public DetalharAtendimentoResponseDTO detalharAtendimento(Long id) {

        Atendimento atendimento = atendimentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Atendimento com o Id não existe!"));

        return new DetalharAtendimentoResponseDTO(atendimento);
    }

    public DetalharAtendimentoResponseDTO concluirAtendimento(Long id, ConcluirAtendimentoRequestDTO dto) {

        Atendimento atendimento = atendimentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Atendimento com esse id não existe!"));

        if (atendimento.getStatusAtendimento() == StatusAtendimento.ATENDIDO) {
            throw new RuntimeException("Esse atendimento ja foi realizado!");
        }

        atendimento.setIntercorrencia(dto.intercorrencia());
        atendimento.setEvolucao(dto.evolucao());

        atendimento.setStatusAtendimento(StatusAtendimento.ATENDIDO);

        Atendimento atendimentoSalvo = atendimentoRepository.save(atendimento);

        return new DetalharAtendimentoResponseDTO(atendimentoSalvo);
    }

    public void registrarPagamento(Long id) {

        Atendimento atendimento = atendimentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Atendimento com esse id não existe!"));

        if (atendimento.getStatusPagamento() == StatusPagamento.PAGO) {
            throw new RuntimeException("Atendimento ja foi pago!");
        }

        atendimento.setStatusPagamento(StatusPagamento.PAGO);

        atendimentoRepository.save(atendimento);

    }

    public List<ListarAtendimentosResponseDTO> listarAtendimentos() {
        return atendimentoRepository.findAll().stream().map(ListarAtendimentosResponseDTO::new).toList();
    }

    public DetalharAtendimentoResponseDTO atualizarAtendimento(Long id, AtualizarAtendimentoRequestDTO dto) {

        Atendimento atendimento = atendimentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Atendimento com esse id não existe!"));

        if (dto.intercorrencia() != null) {
            atendimento.setIntercorrencia(dto.intercorrencia());
        }

        if (dto.evolucao() != null) {
            atendimento.setEvolucao(dto.evolucao());
        }

        if (dto.valor() != null) {
            atendimento.setValor(dto.valor());
        }

        if (dto.taxaDeslocamento() != null) {
            atendimento.setTaxaDeslocamento(dto.taxaDeslocamento());
        }

        atendimentoRepository.save(atendimento);

        return new DetalharAtendimentoResponseDTO(atendimento);

    }

    public List<DetalharAtendimentoResponseDTO> listarAtendimentoPorPaciente(Long pacienteId) {
        return atendimentoRepository.findByAgendamento_Paciente_IdOrderByAgendamento_DataDesc(pacienteId)
                        .stream()
                .map(DetalharAtendimentoResponseDTO::new)
                .toList();
    }

    public List<DetalharAtendimentoResponseDTO> listarAtendimentosPorData(LocalDate dataInicio, LocalDate dataFim){

        if (dataInicio == null || dataFim == null){
            throw new IllegalArgumentException("A data de inicio e a data final são obrigatorias!");
        }

        if (dataInicio.isAfter(dataFim)){
            throw new IllegalArgumentException("Data de inicio não pode ser depois da data final!");
        }

        return atendimentoRepository.findByAgendamento_DataBetween(dataInicio,dataFim)
                .stream()
                .map(DetalharAtendimentoResponseDTO::new)
                .toList();
    }




}
