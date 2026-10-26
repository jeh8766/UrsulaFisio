package com.fisioUrsula.api.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, Object>> usuarioAutenticado(
            @AuthenticationPrincipal OidcUser usuario) {

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("autenticado", false));
        }

        return ResponseEntity.ok(Map.of(
                "autenticado", true,
                "nome", usuario.getFullName(),
                "email", usuario.getEmail()));
    }
}
