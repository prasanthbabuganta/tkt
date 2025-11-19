package com.example.thekingstemple.security;

import com.example.thekingstemple.entity.Role;
import com.example.thekingstemple.service.TokenBlacklistService;
import com.example.thekingstemple.util.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT Authentication Filter
 * Intercepts requests and validates JWT tokens
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                // Check if token is blacklisted
                if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                    log.debug("Token is blacklisted, rejecting request");
                    filterChain.doFilter(request, response);
                    return;
                }

                // Validate token
                if (jwtTokenProvider.validateToken(jwt)) {
                    // Only process access tokens for authentication
                    if (jwtTokenProvider.isAccessToken(jwt)) {
                        Long userId = jwtTokenProvider.getUserIdFromToken(jwt);
                        Role role = jwtTokenProvider.getRoleFromToken(jwt);
                        String tenantId = jwtTokenProvider.getTenantIdFromToken(jwt);

                        // Set tenant context for schema-based multitenancy
                        if (tenantId != null) {
                            TenantContext.setTenantId(tenantId);
                            log.info("[JWT-FILTER] Set campus/tenant context from JWT: {} for user: {} on request: {} {}",
                                    tenantId, userId, request.getMethod(), request.getRequestURI());
                        } else {
                            log.warn("JWT token does not contain tenantId for user: {}. This may cause database queries to fail.", userId);
                        }

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()))
                        );

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        log.info("[JWT-FILTER] Authenticated user: {}, role: {}, campus/tenant: {} for request: {} {}",
                                userId, role, tenantId, request.getMethod(), request.getRequestURI());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clear tenant context after request is processed
            String clearedTenant = TenantContext.getTenantId();
            TenantContext.clear();
            if (clearedTenant != null) {
                log.debug("Cleared tenant context: {} after request completed", clearedTenant);
            }
        }
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
