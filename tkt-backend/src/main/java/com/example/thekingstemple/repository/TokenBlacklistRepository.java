package com.example.thekingstemple.repository;

import com.example.thekingstemple.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {

    /**
     * Check if a token hash exists in the blacklist
     */
    boolean existsByTokenHash(String tokenHash);

    /**
     * Delete all expired tokens (for cleanup)
     */
    void deleteByExpiresAtBefore(LocalDateTime expirationTime);
}
