package com.fisioUrsula.api.entities;

import com.fisioUrsula.api.enums.StatusDiagnostico;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "pacientes_comorbidades")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor
@NoArgsConstructor
public class PacienteComorbidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate dataDiagnostico;

    @Enumerated(EnumType.STRING)
    private StatusDiagnostico statusDiagnostico;

    private String observacao;

}
