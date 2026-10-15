package com.fisioUrsula.api.atendimentos.atendimento;

import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.AgendamentoAtendimento;
import com.fisioUrsula.api.agendamentos.agendamentoAtendimento.AgendamentoAtendimentoRepository;
import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoRequestDTO;
import com.fisioUrsula.api.atendimentos.atendimento.dtos.CriarAtendimentoResponseDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitais;
import com.fisioUrsula.api.atendimentos.sinaisVitais.SinaisVitaisRepository;
import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AtendimentoService {

    public final AtendimentoRepository atendimentoRepository;
    public final AgendamentoAtendimentoRepository agendamentoAtendimentoRepository;
    public final SinaisVitaisRepository sinaisVitaisRepository;


    public CriarAtendimentoResponseDTO criarAtendimento(CriarAtendimentoRequestDTO criarAtendimentoRequestDTO) {

        Atendimento atendimento = new Atendimento();

        atendimento.setData(criarAtendimentoRequestDTO.data());
        atendimento.setHoraInicio(criarAtendimentoRequestDTO.horaInicio());
        atendimento.setHoraFim(criarAtendimentoRequestDTO.horaFim());
        atendimento.setValor(criarAtendimentoRequestDTO.valor());
        atendimento.setTaxaDeslocamento(criarAtendimentoRequestDTO.taxaDeslocamento());
        atendimento.setStatusAgendamento(StatusAgendamento.PENDENTE);
        atendimento.setStatusPagamento(StatusPagamento.PENDENTE);

        AgendamentoAtendimento agendamentoAtendimento = agendamentoAtendimentoRepository.findById(criarAtendimentoRequestDTO.agendamentoAtendimentoId()).orElseThrow(() -> new RuntimeException("Id não existe!"));
        atendimento.setAgendamentoAtendimento(agendamentoAtendimento);

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(criarAtendimentoRequestDTO.sinaisVitaisId()).orElseThrow(() -> new RuntimeException("Id não existe!"));
        atendimento.setSinaisVitais(sinaisVitais);

        Atendimento atendimentoSalvo = atendimentoRepository.save(atendimento);

        CriarAtendimentoResponseDTO criarAtendimentoResponseDTO = new CriarAtendimentoResponseDTO(
                atendimentoSalvo.getId(),
                atendimentoSalvo.getData(),
                atendimentoSalvo.getHoraInicio(),
                atendimentoSalvo.getHoraFim(),
                atendimentoSalvo.getIntercorrencia(),
                atendimentoSalvo.getEvolucao(),
                atendimentoSalvo.getValor(),
                atendimentoSalvo.getTaxaDeslocamento(),
                atendimentoSalvo.getStatusAgendamento(),
                atendimentoSalvo.getStatusPagamento()
        );

        return criarAtendimentoResponseDTO;


    }

}
