package com.example.thekingstemple.service;

import com.example.thekingstemple.entity.TokenBlacklist;
import com.example.thekingstemple.repository.TokenBlacklistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

/**
 * Service for managing blacklisted JWT tokens
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final TokenBlacklistRepository tokenBlacklistRepository;

    /**
     * Add a token to the blacklist
     * @param token The JWT token to blacklist
     * @param expiresAt When the token expires
     * @param reason Reason for blacklisting
     */
    @Transactional
    public void blacklistToken(String token, LocalDateTime expiresAt, String reason) {
        String tokenHash = hashToken(token);

        // Check if already blacklisted
        if (tokenBlacklistRepository.existsByTokenHash(tokenHash)) {
            log.debug("Token already blacklisted");
            return;
        }

        TokenBlacklist blacklistedToken = TokenBlacklist.builder()
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .reason(reason)
                .build();

        tokenBlacklistRepository.save(blacklistedToken);
        log.info("Token blacklisted with reason: {}", reason);
    }

    /**
     * Check if a token is blacklisted
     * @param token The JWT token to check
     * @return true if blacklisted, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        String tokenHash = hashToken(token);
        return tokenBlacklistRepository.existsByTokenHash(tokenHash);
    }

    /**
     * Hash a token using SHA-256
     * @param token The token to hash
     * @return Hex-encoded hash
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Cleanup expired tokens from blacklist (runs daily at 2 AM)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired blacklisted tokens");
        tokenBlacklistRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Completed cleanup of expired blacklisted tokens");
    }
}
