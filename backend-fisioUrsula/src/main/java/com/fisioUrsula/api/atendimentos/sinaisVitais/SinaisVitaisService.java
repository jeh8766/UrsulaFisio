package com.fisioUrsula.api.atendimentos.sinaisVitais;

import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.AtualizarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.DetalharSinaisVitaisResponseDTO;
import org.springframework.stereotype.Service;

import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;

import lombok.RequiredArgsConstructor;

import java.util.Optional;

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

        CriarSinaisVitaisResponseDTO response = new CriarSinaisVitaisResponseDTO(
                sinaisVitaisSalvo.getId(),
                sinaisVitaisSalvo.getPressaoArterial(),
                sinaisVitaisSalvo.getSaturacao(),
                sinaisVitaisSalvo.getFrequenciaCardiaca(),
                sinaisVitaisSalvo.getFrequenciaRespiratoria()
        );

        return response;

    }

    public DetalharSinaisVitaisResponseDTO detalharSinaisVitais(Long id) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(id).orElseThrow(() -> new RuntimeException("Id de sinais vitais nao existe!"));

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);
    }

    public DetalharSinaisVitaisResponseDTO atualizarSinaisVitais(Long id, AtualizarSinaisVitaisRequestDTO dto) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findById(id).orElseThrow(() -> new RuntimeException("Id de sinais vitais nao existe!"));

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

    public DetalharSinaisVitaisResponseDTO BuscarSinaisVitaisPorAtendimento(Long atendimentoId) {

        SinaisVitais sinaisVitais = sinaisVitaisRepository.findByAtendimentoId(atendimentoId).orElseThrow(() -> new RuntimeException("sinais vitais não encontrado por esse atendimento"));

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);

    }
}
