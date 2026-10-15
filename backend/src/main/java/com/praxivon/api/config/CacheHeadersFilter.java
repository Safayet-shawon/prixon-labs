package com.praxivon.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Lets browsers and CDNs cache the public, read-only catalog for a short time. */
@Component
public class CacheHeadersFilter extends OncePerRequestFilter {
    private static final Set<String> PUBLIC_READS = Set.of("/api/catalog", "/api/services", "/api/projects");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean publicRead = "GET".equals(request.getMethod())
            && (PUBLIC_READS.contains(path) || path.startsWith("/api/projects/"));
        response.setHeader("Cache-Control", publicRead
            ? "public, max-age=30, s-maxage=60, stale-while-revalidate=600"
            : "no-store");
        chain.doFilter(request, response);
    }
}
