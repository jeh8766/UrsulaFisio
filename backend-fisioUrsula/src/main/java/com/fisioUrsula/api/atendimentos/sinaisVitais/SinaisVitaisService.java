
package com.fisioUrsula.api.atendimentos.sinaisVitais;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.atendimentos.atendimento.AtendimentoRepository;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.AtualizarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.DetalharSinaisVitaisResponseDTO;
import com.fisioUrsula.api.avaliacoes.avaliacao.Avaliacao;
import com.fisioUrsula.api.avaliacoes.avaliacao.AvaliacaoRepository;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SinaisVitaisService {

    private final SinaisVitaisRepository sinaisVitaisRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    @Transactional
    public CriarSinaisVitaisResponseDTO criarSinaisVitais(
            Long atendimentoId,
            CriarSinaisVitaisRequestDTO dto
    ) {

        Atendimento atendimento = atendimentoRepository
                .findById(atendimentoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Atendimento não encontrado!"
                ));

        if (atendimento.getSinaisVitais() != null) {
            throw new IllegalStateException(
                    "Esse atendimento já possui sinais vitais registrados!"
            );
        }

        SinaisVitais sinaisVitais = criarEntidade(dto);

        sinaisVitais.setAtendimento(atendimento);

        SinaisVitais sinaisSalvos = sinaisVitaisRepository.save(sinaisVitais);

        atendimento.setSinaisVitais(sinaisSalvos);
        atendimentoRepository.save(atendimento);

        return converterParaCriarResponse(sinaisSalvos);
    }

    @Transactional
    public CriarSinaisVitaisResponseDTO criarSinaisVitaisParaAvaliacao(
            Long avaliacaoId,
            CriarSinaisVitaisRequestDTO dto
    ) {

        Avaliacao avaliacao = avaliacaoRepository
                .findById(avaliacaoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Avaliação não encontrada!"
                ));

        if (avaliacao.getSinaisVitais() != null) {
            throw new IllegalStateException(
                    "Essa avaliação já possui sinais vitais registrados!"
            );
        }

        SinaisVitais sinaisVitais = criarEntidade(dto);

        sinaisVitais.setAvaliacao(avaliacao);

        SinaisVitais sinaisSalvos = sinaisVitaisRepository.save(sinaisVitais);

        avaliacao.setSinaisVitais(sinaisSalvos);
        avaliacaoRepository.save(avaliacao);

        return converterParaCriarResponse(sinaisSalvos);
    }

    private SinaisVitais criarEntidade(CriarSinaisVitaisRequestDTO dto) {

        SinaisVitais sinaisVitais = new SinaisVitais();

        sinaisVitais.setPressaoArterial(dto.pressaoArterial());
        sinaisVitais.setSaturacao(dto.saturacao());
        sinaisVitais.setFrequenciaCardiaca(dto.frequenciaCardiaca());
        sinaisVitais.setFrequenciaRespiratoria(dto.frequenciaRespiratoria());

        return sinaisVitais;
    }

    private CriarSinaisVitaisResponseDTO converterParaCriarResponse(
            SinaisVitais sinaisVitais
    ) {

        return new CriarSinaisVitaisResponseDTO(
                sinaisVitais.getId(),
                sinaisVitais.getPressaoArterial(),
                sinaisVitais.getSaturacao(),
                sinaisVitais.getFrequenciaCardiaca(),
                sinaisVitais.getFrequenciaRespiratoria()
        );
    }

    @Transactional(readOnly = true)
    public DetalharSinaisVitaisResponseDTO detalharSinaisVitais(Long id) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Id de sinais vitais não existe!"
                ));

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);
    }

    @Transactional
    public DetalharSinaisVitaisResponseDTO atualizarSinaisVitais(
            Long id,
            AtualizarSinaisVitaisRequestDTO dto
    ) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Id de sinais vitais não existe!"
                ));

        if (dto.pressaoArterial() != null) {
            sinaisVitais.setPressaoArterial(dto.pressaoArterial());
        }

        if (dto.frequenciaCardiaca() != null) {
            sinaisVitais.setFrequenciaCardiaca(dto.frequenciaCardiaca());
        }

        if (dto.saturacao() != null) {
            sinaisVitais.setSaturacao(dto.saturacao());
        }

        if (dto.frequenciaRespiratoria() != null) {
            sinaisVitais.setFrequenciaRespiratoria(dto.frequenciaRespiratoria());
        }

        return new DetalharSinaisVitaisResponseDTO(
                sinaisVitaisRepository.save(sinaisVitais)
        );
    }

    @Transactional(readOnly = true)
    public DetalharSinaisVitaisResponseDTO buscarSinaisVitaisPorAtendimento(
            Long atendimentoId
    ) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository
                .findByAtendimentoId(atendimentoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Sinais vitais não encontrados para esse atendimento!"
                ));

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);
    }

    @Transactional(readOnly = true)
    public DetalharSinaisVitaisResponseDTO buscarSinaisVitaisPorAvaliacao(
            Long avaliacaoId
    ) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository
                .findByAvaliacaoId(avaliacaoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException(
                        "Sinais vitais não encontrados para essa avaliação!"
                ));

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);
    }
}
