package com.fisioUrsula.api.pacientes.paciente;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fisioUrsula.api.agendamentos.agendamentoAvaliacao.AgendamentoAvaliacao;
import com.fisioUrsula.api.pacientes.endereco.Endereco;
import com.fisioUrsula.api.pacientes.paciente.dtos.CadastrarPacienteRequestDTO;
import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Paciente implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_paciente")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Vinculo vinculo;

    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Column(nullable = false, length = 40)
    private String nome;

    @Column(nullable = false, length = 40)
    private String nomeResponsavel;

    @Column(nullable = false, length = 20)
    private String telefone;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_endereco")
    private Endereco endereco;

    @OneToMany(mappedBy = "paciente")
    private List<PacienteComorbidade> comorbidades = new ArrayList<>();

    @OneToMany(mappedBy = "paciente")
    private List<AgendamentoAvaliacao> agendamentos = new ArrayList<>();

    public Paciente(CadastrarPacienteRequestDTO dto) {
        this.nome = dto.nome();
        this.dataNascimento = dto.dataNascimento();
        this.vinculo = dto.vinculo();
        this.nomeResponsavel = dto.nomeResponsavel();
        this.telefone = dto.telefone();

        this.endereco = new Endereco();
        this.endereco.setCep(dto.cep());
        this.endereco.setEstado(dto.estado());
        this.endereco.setCidade(dto.cidade());
        this.endereco.setBairro(dto.bairro());
        this.endereco.setComplemento(dto.complemento());
    }
}
