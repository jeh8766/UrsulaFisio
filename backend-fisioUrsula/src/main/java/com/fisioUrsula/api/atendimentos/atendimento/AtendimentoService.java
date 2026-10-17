package com.fisioUrsula.api.atendimentos.atendimento;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.agendamentos.Agendamento;
import com.fisioUrsula.api.agendamentos.AgendamentoRepository;
import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoRequestDTO;
import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoResponseDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitaisRepository;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import com.fisioUrsula.api.shared.enums.TipoAgendamento;

import lombok.RequiredArgsConstructor;

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
                .orElseThrow(() -> new RuntimeException("Id não existe!"));
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

}
