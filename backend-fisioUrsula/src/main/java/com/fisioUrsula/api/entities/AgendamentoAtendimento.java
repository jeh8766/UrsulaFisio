package com.fisioUrsula.api.entities;

import com.fisioUrsula.api.enums.StatusAgendamento;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos_atendimentos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor
@NoArgsConstructor
public class AgendamentoAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate data;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFim;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    private LocalDate dataCancelamento;


}
