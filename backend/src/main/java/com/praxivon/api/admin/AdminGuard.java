package com.praxivon.api.admin;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AdminGuard {
    private final byte[] expected;

    public AdminGuard(@Value("${praxivon.admin.password:}") String secret) {
        this.expected = secret.getBytes(StandardCharsets.UTF_8);
    }

    public boolean allows(String provided) {
        if (expected.length == 0 || provided == null) return false;
        return MessageDigest.isEqual(
            expected,
            provided.getBytes(StandardCharsets.UTF_8)
        );
    }
}