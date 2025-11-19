package com.example.thekingstemple.service;

import com.example.thekingstemple.dto.request.LoginRequest;
import com.example.thekingstemple.dto.request.RefreshTokenRequest;
import com.example.thekingstemple.dto.response.LoginResponse;
import com.example.thekingstemple.entity.User;
import com.example.thekingstemple.exception.InvalidCredentialsException;
import com.example.thekingstemple.repository.UserRepository;
import com.example.thekingstemple.security.JwtTokenProvider;
import com.example.thekingstemple.util.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;

/**
 * Service for authentication (login, token refresh, logout)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;
    private final TokenBlacklistService tokenBlacklistService;

    @Value("${jwt.access-token-expiry}")
    private long accessTokenExpiry;

    /**
     * Login with mobile number and PIN
     */
    public LoginResponse login(LoginRequest request) {
        // Set tenant context BEFORE starting transaction
        // This ensures Hibernate uses the correct schema when the transaction starts
        TenantContext.setTenantId(request.getTenantId());
        log.info("[AUTH-LOGIN] Set tenant context to: {} for login request", request.getTenantId());
        try {
            return performLogin(request);
        } finally {
            // Always clear tenant context after login completes
            TenantContext.clear();
            log.debug("Cleared tenant context after login completion");
        }
    }

    /**
     * Performs the actual login logic within a transaction
     * Note: Must be public for Spring AOP @Transactional to work
     */
    @Transactional
    public LoginResponse performLogin(LoginRequest request) {
        log.info("[AUTH-PERFORM-LOGIN] Transaction started, tenant context is: {}", TenantContext.getTenantId());

        // Hash the mobile number to find user
        String mobileHash = encryptionService.hash(request.getMobileNumber());

        // Find user by mobile hash and tenant ID
        User user = userRepository.findByMobileHashAndTenantId(mobileHash, request.getTenantId())
                .orElseThrow(InvalidCredentialsException::new);

        // Check if user is active
        if (!user.getActive()) {
            throw new InvalidCredentialsException("Account is inactive");
        }

        // Verify PIN
        if (!passwordEncoder.matches(request.getPin(), user.getPinHash())) {
            throw new InvalidCredentialsException();
        }

        // Generate tokens with tenant ID
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getMobileHash(), user.getRole(), user.getTenantId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getTenantId());

        log.info("User logged in: {} with role: {} for tenant: {}", user.getId(), user.getRole(), user.getTenantId());

        // Audit log
        auditLogService.log(user.getId(), "LOGIN");

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiry)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .mobileNumber(encryptionService.decrypt(user.getMobileNumber()))
                        .role(user.getRole())
                        .tenantId(user.getTenantId())
                        .build())
                .build();
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        // Validate refresh token
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        // Check if it's actually a refresh token
        if (!jwtTokenProvider.isRefreshToken(request.getRefreshToken())) {
            throw new InvalidCredentialsException("Not a valid refresh token");
        }

        // Get user ID and tenant ID from token
        Long userId = jwtTokenProvider.getUserIdFromToken(request.getRefreshToken());
        String tenantId = jwtTokenProvider.getTenantIdFromToken(request.getRefreshToken());

        // Set tenant context before querying user
        TenantContext.setTenantId(tenantId);
        log.info("[AUTH-REFRESH] Set tenant context to: {} for token refresh (userId: {})", tenantId, userId);

        // Register callback to clear tenant context AFTER transaction commits
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                TenantContext.clear();
                log.debug("Cleared tenant context after refresh token transaction completion");
            }
        });

        // Find user in the correct tenant schema
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        // Check if user is active
        if (!user.getActive()) {
            throw new InvalidCredentialsException("Account is inactive");
        }

        // Generate new access token with tenant ID (refresh token remains the same)
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getMobileHash(), user.getRole(), user.getTenantId());

        log.info("Access token refreshed for user: {} for tenant: {}", user.getId(), user.getTenantId());

        // Audit log
        auditLogService.log(user.getId(), "TOKEN_REFRESH");

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken()) // Return same refresh token
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiry)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .mobileNumber(encryptionService.decrypt(user.getMobileNumber()))
                        .role(user.getRole())
                        .tenantId(user.getTenantId())
                        .build())
                .build();
    }

    /**
     * Logout - blacklist both access and refresh tokens
     */
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        // Validate and blacklist access token
        if (accessToken != null && jwtTokenProvider.validateToken(accessToken)) {
            LocalDateTime accessTokenExpiry = jwtTokenProvider.getExpirationFromToken(accessToken);
            tokenBlacklistService.blacklistToken(accessToken, accessTokenExpiry, "LOGOUT");

            // Get user ID for audit log
            Long userId = jwtTokenProvider.getUserIdFromToken(accessToken);

            // Audit log
            auditLogService.log(userId, "LOGOUT");

            log.info("User logged out: {}", userId);
        }

        // Validate and blacklist refresh token
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            LocalDateTime refreshTokenExpiry = jwtTokenProvider.getExpirationFromToken(refreshToken);
            tokenBlacklistService.blacklistToken(refreshToken, refreshTokenExpiry, "LOGOUT");
        }
    }
}
