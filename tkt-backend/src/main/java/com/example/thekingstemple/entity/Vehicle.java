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
@Table(name = "vehicles", indexes = {
        @Index(name = "idx_vehicle_number_hash", columnList = "vehicle_number_hash", unique = true),
        @Index(name = "idx_owner_mobile_hash", columnList = "owner_mobile_hash"),
        @Index(name = "idx_vehicle_type", columnList = "vehicle_type"),
        @Index(name = "idx_created_by", columnList = "created_by_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String ownerName;

    /**
     * Encrypted owner mobile number (AES-256-GCM)
     */
    @Column(nullable = false, length = 500)
    private String ownerMobile;

    /**
     * SHA-256 hash of owner mobile for searching
     */
    @Column(nullable = false, length = 64)
    private String ownerMobileHash;

    /**
     * Encrypted vehicle number (AES-256-GCM)
     */
    @Column(nullable = false, length = 500)
    private String vehicleNumber;

    /**
     * SHA-256 hash of vehicle number for searching and uniqueness
     */
    @Column(nullable = false, unique = true, length = 64)
    private String vehicleNumberHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private VehicleType vehicleType;

    /**
     * User who created this vehicle record (for audit)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private Boolean active = true;

    /**
     * URL of the car image stored in Google Cloud Storage (optional)
     */
    @Column(length = 500)
    private String carImageUrl;

    /**
     * URL of the key image stored in Google Cloud Storage (optional)
     */
    @Column(length = 500)
    private String keyImageUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
