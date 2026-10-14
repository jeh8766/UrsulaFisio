package com.fisioUrsula.api.pacientes.paciente;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.fisioUrsula.api.pacientes.pacienteComorbidades.PacienteComorbidade;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public class PacienteSpecification {

    public static Specification<Paciente> filtrar(String nome, FaixaEtaria faixaEtaria,
                                                  Long comorbidadeId, boolean ativo) {

        return (root, query, cb) -> {
            List<Predicate> filtros = new ArrayList<>();

            filtros.add(cb.equal(root.get("ativo"), ativo));

            if (nome != null && !nome.isBlank()) {
                filtros.add(cb.like(cb.lower(root.get("nome")), "%" + nome.trim().toLowerCase() + "%"));
            }

            if (faixaEtaria != null) {
                LocalDate hoje = LocalDate.now();
                switch (faixaEtaria) {
                    case PEDIATRICO -> filtros.add(
                            cb.greaterThan(root.<LocalDate>get("dataNascimento"), hoje.minusYears(18)));
                    case ADULTO -> {
                        filtros.add(cb.lessThanOrEqualTo(root.<LocalDate>get("dataNascimento"), hoje.minusYears(18)));
                        filtros.add(cb.greaterThan(root.<LocalDate>get("dataNascimento"), hoje.minusYears(60)));
                    }
                    case IDOSO -> filtros.add(
                            cb.lessThanOrEqualTo(root.<LocalDate>get("dataNascimento"), hoje.minusYears(60)));
                }
            }

            if (comorbidadeId != null) {
                Subquery<Long> sub = query.subquery(Long.class);
                Root<PacienteComorbidade> pc = sub.from(PacienteComorbidade.class);
                sub.select(pc.<Long>get("id")).where(
                        cb.equal(pc.get("paciente"), root),
                        cb.equal(pc.get("comorbidade").get("id"), comorbidadeId));
                filtros.add(cb.exists(sub));
            }

            return cb.and(filtros.toArray(new Predicate[0]));
        };
    }
}