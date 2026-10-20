package com.fisioUrsula.api.avaliacoes.avaliacao.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.shared.enums.StatusAtendimento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

public record ListarAvaliacoesResponseDTO(Long id,
        String queixaPrincipal,
        String observacao,
        BigDecimal valor,
        StatusPagamento statusPagamento,
        StatusAtendimento statusAtendimento,
        String nomePaciente,
        LocalDate data,
        LocalTime hora) {

    public ListarAvaliacoesResponseDTO(Avaliacao avaliacao) {
        this(
                avaliacao.getId(),
                avaliacao.getQueixaPrincipal(),
                avaliacao.getObservacao(),
                avaliacao.getValor(),
                avaliacao.getStatusPagamento(),
                avaliacao.getStatusAtendimento(),
                avaliacao.getAgendamento().getPaciente().getNome(),
                avaliacao.getAgendamento().getData(),
                avaliacao.getAgendamento().getHoraInicio());
    }

}
