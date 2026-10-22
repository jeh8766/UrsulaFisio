package com.fisioUrsula.api.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${app.security.google.allowed-email}")
    private List<String> emailsAutorizados;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, OidcUserService oidcUserService)
            throws Exception {

        http.authorizeHttpRequests(auth -> auth
                // .anyRequest().authenticated())
                .anyRequest().permitAll())
                .oauth2Login(oauth2 -> oauth2.userInfoEndpoint(userInfo -> userInfo
                        .oidcUserService(oidcUserService))
                        .defaultSuccessUrl("http://localhost:5173/dashboard", true))
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(
                                jakarta.servlet.http.HttpServletResponse.SC_NO_CONTENT)));

        return http.build();
    }

    @Bean
    public OidcUserService oidcUserService() {

        OidcUserService servicoPadrao = new OidcUserService();

        return new OidcUserService() {
            @Override
            public OidcUser loadUser(
                    org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest requisicao) {

                OidcUser usuario = servicoPadrao.loadUser(requisicao);

                String email = usuario.getClaimAsString("email");
                Boolean emailVerificado = usuario.getClaimAsBoolean("email_verified");

                boolean emailCorreto = email != null && emailsAutorizados.stream()
                        .map(e -> e.trim())
                        .anyMatch(e -> email.equalsIgnoreCase(e));

                if (!emailCorreto || !Boolean.TRUE.equals(emailVerificado)) {
                    throw new OAuth2AuthenticationException(
                            new OAuth2Error(
                                    "access_denied",
                                    "Conta Google não autorizada.",
                                    null));
                }

                return usuario;
            }
        };
    }
}
