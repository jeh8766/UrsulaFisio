package com.fisioUrsula.api.services;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.repositories.PacienteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

}