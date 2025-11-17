package com.example.thekingstemple.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_mobile_hash", columnList = "mobile_hash"),
        @Index(name = "idx_role", columnList = "role"),
        @Index(name = "idx_tenant_id", columnList = "tenant_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tenant ID (Campus: east, west, north, south)
     */
    @Column(nullable = false, length = 20)
    private String tenantId;

    /**
     * Encrypted mobile number (AES-256-GCM)
     */
    @Column(nullable = false, length = 500)
    private String mobileNumber;

    /**
     * SHA-256 hash of mobile number for searching
     */
    @Column(nullable = false, unique = true, length = 64)
    private String mobileHash;

    /**
     * BCrypt hashed PIN (6 digits)
     */
    @Column(nullable = false, length = 60)
    private String pinHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
