package com.fisioUrsula.api.services;

import org.springframework.stereotype.Service;

import com.fisioUrsula.api.repositories.EnderecoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

}
