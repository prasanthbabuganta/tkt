package com.example.thekingstemple.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "visits",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_vehicle_visit_date", columnNames = {"vehicle_id", "visit_date"})
    },
    indexes = {
        @Index(name = "idx_visit_date", columnList = "visit_date"),
        @Index(name = "idx_vehicle_id", columnList = "vehicle_id"),
        @Index(name = "idx_marked_by", columnList = "marked_by_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Date of the visit (for daily tracking)
     */
    @Column(nullable = false)
    private LocalDate visitDate;

    /**
     * Timestamp when vehicle arrived
     */
    @Column(nullable = false)
    private LocalDateTime arrivedAt;

    /**
     * User who marked this arrival (for audit)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by_id", nullable = false)
    private User markedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
