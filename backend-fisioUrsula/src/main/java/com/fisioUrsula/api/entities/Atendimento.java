package com.fisioUrsula.api.entities;

import com.fisioUrsula.api.enums.StatusAgendamento;
import com.fisioUrsula.api.enums.StatusPagamento;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(name = "atendimentos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor
@NoArgsConstructor
public class Atendimento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate data;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFim;
    private String intercorrencia;
    private String evolucao;
    private Double valor;
    private Double taxaDeslocamento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;


}
