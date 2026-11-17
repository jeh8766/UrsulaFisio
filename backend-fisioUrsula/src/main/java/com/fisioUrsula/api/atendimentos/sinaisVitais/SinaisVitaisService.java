package com.fisioUrsula.api.atendimentos.sinaisVitais;

import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.AtualizarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.DetalharSinaisVitaisResponseDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import org.springframework.stereotype.Service;

import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class SinaisVitaisService {

    private final SinaisVitaisRepository sinaisVitaisRepository;

    @Transactional
    public CriarSinaisVitaisResponseDTO criarSinaisVitais(CriarSinaisVitaisRequestDTO criarSinaisVitaisRequestDTO) {

        SinaisVitais sinaisVitais = new SinaisVitais();

        sinaisVitais.setPressaoArterial(criarSinaisVitaisRequestDTO.pressaoArterial());
        sinaisVitais.setSaturacao(criarSinaisVitaisRequestDTO.saturacao());
        sinaisVitais.setFrequenciaCardiaca(criarSinaisVitaisRequestDTO.frequenciaCardiaca());
        sinaisVitais.setFrequenciaRespiratoria(criarSinaisVitaisRequestDTO.frequenciaRespiratoria());

        SinaisVitais sinaisVitaisSalvo = sinaisVitaisRepository.save(sinaisVitais);

        CriarSinaisVitaisResponseDTO criarSinaisVitaisResponseDTO = new CriarSinaisVitaisResponseDTO(
                sinaisVitaisSalvo.getId(),
                sinaisVitaisSalvo.getPressaoArterial(),
                sinaisVitaisSalvo.getSaturacao(),
                sinaisVitaisSalvo.getFrequenciaCardiaca(),
                sinaisVitaisSalvo.getFrequenciaRespiratoria()
        );

        return criarSinaisVitaisResponseDTO;

    }

    public DetalharSinaisVitaisResponseDTO detalharSinaisVitais(Long id) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Id de sinais vitais nao existe!"));

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);
    }

    @Transactional
    public DetalharSinaisVitaisResponseDTO atualizarSinaisVitais(Long id, AtualizarSinaisVitaisRequestDTO dto) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(id).orElseThrow(() -> new RegistroNaoEncontradoException("Id de sinais vitais nao existe!"));

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

        sinaisVitaisRepository.save(sinaisVitais);

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);
    }

    public DetalharSinaisVitaisResponseDTO buscarSinaisVitaisPorAtendimento(Long atendimentoId) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findByAtendimento_Id(atendimentoId).orElseThrow(() -> new RegistroNaoEncontradoException("sinais vitais não encontrado por esse atendimento"));

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);

    }
}
