package com.fisioUrsula.api.atendimentos.sinaisVitais;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SinaisVitaisService {

    public final SinaisVitaisRepository sinaisVitaisRepository;

    public CriarSinaisVitaisResponseDTO criarSinaisVitais(CriarSinaisVitaisRequestDTO criarSinaisVitaisRequestDTO) {

        SinaisVitais sinaisVitais = new SinaisVitais();

        sinaisVitais.setPressaoArterial(criarSinaisVitaisRequestDTO.pressaoArterial());
        sinaisVitais.setSaturacao(criarSinaisVitaisRequestDTO.saturacao());
        sinaisVitais.setFrequenciaCardiaca(criarSinaisVitaisRequestDTO.frequenciaCardiaca());
        sinaisVitais.setFrequenciaRespiratoria(criarSinaisVitaisRequestDTO.frequenciaRespiratoria());

        SinaisVitais sinaisVitaisSalvo = sinaisVitaisRepository.save(sinaisVitais);

        CriarSinaisVitaisResponseDTO criarSinaisVitaisResponseDTO = new CriarSinaisVitaisResponseDTO(
                sinaisVitaisSalvo.getPressaoArterial(),
                sinaisVitaisSalvo.getSaturacao(),
                sinaisVitaisSalvo.getFrequenciaCardiaca(),
                sinaisVitaisSalvo.getFrequenciaRespiratoria());

        return criarSinaisVitaisResponseDTO;

    }
}
