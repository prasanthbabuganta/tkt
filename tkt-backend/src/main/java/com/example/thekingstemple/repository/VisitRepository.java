package com.example.thekingstemple.repository;

import com.example.thekingstemple.entity.Vehicle;
import com.example.thekingstemple.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {

    /**
     * Find visit by vehicle and date (for idempotency check)
     */
    Optional<Visit> findByVehicleAndVisitDate(Vehicle vehicle, LocalDate visitDate);

    /**
     * Check if vehicle has visited on a specific date
     */
    boolean existsByVehicleAndVisitDate(Vehicle vehicle, LocalDate visitDate);

    /**
     * Find all visits for a specific date
     */
    List<Visit> findByVisitDateOrderByArrivedAtAsc(LocalDate visitDate);

    /**
     * Find all visits for a date range
     */
    List<Visit> findByVisitDateBetweenOrderByVisitDateDescArrivedAtAsc(LocalDate startDate, LocalDate endDate);

    /**
     * Count visits for a specific date
     */
    long countByVisitDate(LocalDate visitDate);

    /**
     * Find all visits for a specific vehicle
     */
    List<Visit> findByVehicleOrderByVisitDateDescArrivedAtDesc(Vehicle vehicle);

    /**
     * Get all vehicle IDs that have visited on a specific date
     */
    @Query("SELECT v.vehicle.id FROM Visit v WHERE v.visitDate = :visitDate")
    List<Long> findVehicleIdsByVisitDate(@Param("visitDate") LocalDate visitDate);
}
