
package com.fisioUrsula.api.atendimentos.sinaisVitais;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.atendimentos.atendimento.AtendimentoRepository;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.AtualizarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisRequestDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.CriarSinaisVitaisResponseDTO;
import com.fisioUrsula.api.atendimentos.sinaisVitais.dtos.DetalharSinaisVitaisResponseDTO;
import com.fisioUrsula.api.shared.exceptions.RegistroNaoEncontradoException;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SinaisVitaisService {
    public interface SinaisVitaisRepository
            extends JpaRepository<SinaisVitais, Long> {

        Optional<SinaisVitais> findByAtendimentoId(Long atendimentoId);
    }

    private final SinaisVitaisRepository sinaisVitaisRepository;
    private final AtendimentoRepository atendimentoRepository;

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

        SinaisVitais sinaisVitais = new SinaisVitais();

        sinaisVitais.setPressaoArterial(dto.pressaoArterial());
        sinaisVitais.setSaturacao(dto.saturacao());
        sinaisVitais.setFrequenciaCardiaca(dto.frequenciaCardiaca());
        sinaisVitais.setFrequenciaRespiratoria(dto.frequenciaRespiratoria());

        SinaisVitais sinaisSalvos = sinaisVitaisRepository.save(sinaisVitais);

        atendimento.setSinaisVitais(sinaisSalvos);
        atendimentoRepository.save(atendimento);

        return new CriarSinaisVitaisResponseDTO(
                sinaisSalvos.getId(),
                sinaisSalvos.getPressaoArterial(),
                sinaisSalvos.getSaturacao(),
                sinaisSalvos.getFrequenciaCardiaca(),
                sinaisSalvos.getFrequenciaRespiratoria()
        );
    }

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

        sinaisVitaisRepository.save(sinaisVitais);

        return new DetalharSinaisVitaisResponseDTO(sinaisVitais);
    }

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
}
