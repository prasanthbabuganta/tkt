package com.example.thekingstemple.repository;

import com.example.thekingstemple.entity.Vehicle;
import com.example.thekingstemple.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Find vehicle by vehicle number hash (for uniqueness and exact lookup)
     */
    Optional<Vehicle> findByVehicleNumberHash(String vehicleNumberHash);

    /**
     * Check if vehicle number hash exists
     */
    boolean existsByVehicleNumberHash(String vehicleNumberHash);

    /**
     * Find all active vehicles
     */
    List<Vehicle> findByActiveTrueOrderByCreatedAtDesc();

    /**
     * Find vehicles by type
     */
    List<Vehicle> findByVehicleTypeAndActiveTrueOrderByCreatedAtDesc(VehicleType vehicleType);

    /**
     * Find vehicles by owner mobile hash
     */
    List<Vehicle> findByOwnerMobileHashAndActiveTrueOrderByCreatedAtDesc(String ownerMobileHash);

    /**
     * Find vehicles by partial vehicle number hash match (for search)
     * Note: This is for hash-based partial search, may not work well for encrypted data
     * We'll need to decrypt and search in service layer for better results
     */
    @Query("SELECT v FROM Vehicle v WHERE v.active = true ORDER BY v.createdAt DESC")
    List<Vehicle> findAllActiveVehicles();
}
