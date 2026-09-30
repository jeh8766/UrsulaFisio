package com.fisioUrsula.api.services;

import com.fisioUrsula.api.repositories.PacienteRepository;
import  org.springframework.stereotype.Service;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }
}