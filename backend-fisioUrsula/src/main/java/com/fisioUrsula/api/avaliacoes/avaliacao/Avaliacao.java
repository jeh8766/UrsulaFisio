package com.fisioUrsula.api.avaliacoes.avaliacao;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fisioUrsula.api.shared.enums.StatusAgendamento;
import com.fisioUrsula.api.shared.enums.StatusPagamento;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "avaliacoes")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Avaliacao implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String queixaPrincipal;
    private LocalDate data;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFim;

    @Enumerated(EnumType.STRING)
    private StatusPagamento statusPagamento;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento;

    private String observacao;
    private Double valor;

}
