package com.example.thekingstemple.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "token_blacklist", indexes = {
        @Index(name = "idx_token_hash", columnList = "tokenHash", unique = true),
        @Index(name = "idx_expires_at", columnList = "expiresAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * SHA-256 hash of the blacklisted token
     */
    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    /**
     * When the token expires (for cleanup purposes)
     */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /**
     * When the token was blacklisted
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime blacklistedAt;

    /**
     * Reason for blacklisting (e.g., "LOGOUT", "SECURITY_BREACH")
     */
    @Column(length = 50)
    private String reason;

    @PrePersist
    protected void onCreate() {
        blacklistedAt = LocalDateTime.now();
    }
}
