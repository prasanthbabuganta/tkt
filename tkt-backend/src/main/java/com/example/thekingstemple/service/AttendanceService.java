package com.example.thekingstemple.service;

import com.example.thekingstemple.dto.response.VehicleResponse;
import com.example.thekingstemple.dto.response.VisitResponse;
import com.example.thekingstemple.entity.User;
import com.example.thekingstemple.entity.Vehicle;
import com.example.thekingstemple.entity.Visit;
import com.example.thekingstemple.exception.AlreadyMarkedException;
import com.example.thekingstemple.exception.ResourceNotFoundException;
import com.example.thekingstemple.repository.UserRepository;
import com.example.thekingstemple.repository.VehicleRepository;
import com.example.thekingstemple.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for attendance/visit management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final VisitRepository visitRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final VehicleService vehicleService;
    private final EncryptionService encryptionService;
    private final AuditLogService auditLogService;

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    /**
     * Mark vehicle arrival for today
     */
    @Transactional
    public VisitResponse markArrival(String vehicleNumber, Long markedByUserId) {
        LocalDate today = LocalDate.now(IST_ZONE);
        LocalDateTime now = LocalDateTime.now(IST_ZONE);

        // Get vehicle
        Vehicle vehicle = vehicleService.getVehicleEntityByNumber(vehicleNumber);

        // Check if already marked today
        if (visitRepository.existsByVehicleAndVisitDate(vehicle, today)) {
            throw new AlreadyMarkedException(vehicleNumber, today);
        }

        // Get user who is marking
        User markedBy = userRepository.findById(markedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", markedByUserId));

        // Create visit
        Visit visit = Visit.builder()
                .vehicle(vehicle)
                .visitDate(today)
                .arrivedAt(now)
                .markedBy(markedBy)
                .build();

        Visit savedVisit = visitRepository.save(visit);
        log.info("Arrival marked for vehicle: {} by user: {}", vehicleNumber, markedByUserId);

        // Audit log
        auditLogService.log(
                markedByUserId,
                "MARK_ARRIVAL",
                "VISIT",
                savedVisit.getId().toString(),
                String.format("Marked arrival for vehicle: %s", vehicleNumber)
        );

        return mapToResponse(savedVisit);
    }

    /**
     * Get unmarked vehicles for today
     * Returns vehicles that have NOT been marked yet for today
     */
    @Transactional(readOnly = true)
    public List<VehicleResponse> getUnmarkedVehiclesForToday() {
        LocalDate today = LocalDate.now(IST_ZONE);

        // Get all vehicle IDs that have been marked today
        List<Long> markedVehicleIds = visitRepository.findVehicleIdsByVisitDate(today);

        // Get all active vehicles and filter out marked ones
        return vehicleRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .filter(vehicle -> !markedVehicleIds.contains(vehicle.getId()))
                .map(this::mapVehicleToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all visits for a specific date
     */
    @Transactional(readOnly = true)
    public List<VisitResponse> getVisitsForDate(LocalDate date) {
        return visitRepository.findByVisitDateOrderByArrivedAtAsc(date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get visits for today
     */
    @Transactional(readOnly = true)
    public List<VisitResponse> getVisitsForToday() {
        LocalDate today = LocalDate.now(IST_ZONE);
        return getVisitsForDate(today);
    }

    /**
     * Map Visit entity to VisitResponse DTO
     */
    private VisitResponse mapToResponse(Visit visit) {
        return VisitResponse.builder()
                .id(visit.getId())
                .vehicle(mapVehicleToResponse(visit.getVehicle()))
                .visitDate(visit.getVisitDate())
                .arrivedAt(visit.getArrivedAt())
                .markedById(visit.getMarkedBy().getId())
                .markedByMobile(encryptionService.decrypt(visit.getMarkedBy().getMobileNumber()))
                .createdAt(visit.getCreatedAt())
                .build();
    }

    /**
     * Map Vehicle entity to VehicleResponse DTO
     */
    private VehicleResponse mapVehicleToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .ownerName(vehicle.getOwnerName())
                .ownerMobile(encryptionService.decrypt(vehicle.getOwnerMobile()))
                .vehicleNumber(encryptionService.decrypt(vehicle.getVehicleNumber()))
                .vehicleType(vehicle.getVehicleType())
                .createdById(vehicle.getCreatedBy().getId())
                .createdByMobile(encryptionService.decrypt(vehicle.getCreatedBy().getMobileNumber()))
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
