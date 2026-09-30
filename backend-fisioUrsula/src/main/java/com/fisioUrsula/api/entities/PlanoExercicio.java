package com.fisioUrsula.api.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "planos_exercicios")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor
@NoArgsConstructor
public class PlanoExercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String observacao;
}
