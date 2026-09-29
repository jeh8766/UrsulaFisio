package com.fisioUrsula.api.services;

import org.springframework.stereotype.Service;

@Service
public class PacienteRepository {

    private final PacienteRepository pacienteRepository;

    public PacienteRepository(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }
}
