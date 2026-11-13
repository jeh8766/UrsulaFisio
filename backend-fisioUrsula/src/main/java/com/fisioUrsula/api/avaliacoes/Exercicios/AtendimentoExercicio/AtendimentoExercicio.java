package com.fisioUrsula.api.avaliacoes.Exercicios.AtendimentoExercicio;

import com.fisioUrsula.api.atendimentos.atendimento.Atendimento;
import com.fisioUrsula.api.avaliacoes.Exercicios.exercicios.Exercicio;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "atendimento_exercicio",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"atendimento_id", "exercicio_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class AtendimentoExercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "atendimento_id", nullable = false)
    private Atendimento atendimento;

    @ManyToOne
    @JoinColumn(name = "exercicio_id", nullable = false)
    private Exercicio exercicio;
}
