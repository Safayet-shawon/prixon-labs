package com.praxivon.api.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    private final String origins;

    public CorsConfig(@Value("${praxivon.cors.origins:}") String origins) { this.origins = origins; }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (!origins.isBlank()) {
            String[] allowed = Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);
            registry.addMapping("/api/**").allowedOrigins(allowed).allowedMethods("GET", "POST");
        }
    }
}
