package com.example.thekingstemple.service;

import com.example.thekingstemple.dto.request.CreateVehicleRequest;
import com.example.thekingstemple.dto.response.VehicleResponse;
import com.example.thekingstemple.entity.User;
import com.example.thekingstemple.entity.Vehicle;
import com.example.thekingstemple.exception.DuplicateResourceException;
import com.example.thekingstemple.exception.ResourceNotFoundException;
import com.example.thekingstemple.repository.UserRepository;
import com.example.thekingstemple.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for vehicle management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final AuditLogService auditLogService;
    private final StorageService storageService;

    /**
     * Register new vehicle
     */
    @Transactional
    public VehicleResponse createVehicle(CreateVehicleRequest request, Long createdByUserId) {
        // Normalize vehicle number to uppercase
        String normalizedVehicleNumber = request.getVehicleNumber().toUpperCase();

        // Hash vehicle number to check uniqueness
        String vehicleNumberHash = encryptionService.hash(normalizedVehicleNumber);

        // Check if vehicle already exists
        if (vehicleRepository.existsByVehicleNumberHash(vehicleNumberHash)) {
            throw new DuplicateResourceException("Vehicle", "vehicle number", normalizedVehicleNumber);
        }

        // Get creator user
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdByUserId));

        // Encrypt and hash vehicle number and owner mobile
        EncryptionService.EncryptedData encryptedVehicleNumber = encryptionService.encryptAndHash(normalizedVehicleNumber);
        EncryptionService.EncryptedData encryptedOwnerMobile = encryptionService.encryptAndHash(request.getOwnerMobile());

        // Create vehicle
        Vehicle vehicle = Vehicle.builder()
                .ownerName(request.getOwnerName())
                .ownerMobile(encryptedOwnerMobile.encrypted())
                .ownerMobileHash(encryptedOwnerMobile.hash())
                .vehicleNumber(encryptedVehicleNumber.encrypted())
                .vehicleNumberHash(encryptedVehicleNumber.hash())
                .vehicleType(request.getVehicleType())
                .createdBy(createdBy)
                .active(true)
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle created with ID: {} by user: {}", savedVehicle.getId(), createdByUserId);

        // Audit log
        auditLogService.log(
                createdByUserId,
                "CREATE_VEHICLE",
                "VEHICLE",
                savedVehicle.getId().toString(),
                String.format("Registered vehicle: %s", normalizedVehicleNumber)
        );

        return mapToResponse(savedVehicle);
    }

    /**
     * Register new vehicle with optional photos
     */
    @Transactional
    public VehicleResponse createVehicleWithPhotos(
            CreateVehicleRequest request,
            MultipartFile carImage,
            MultipartFile keyImage,
            Long createdByUserId
    ) throws IOException {
        // Normalize vehicle number to uppercase
        String normalizedVehicleNumber = request.getVehicleNumber().toUpperCase();

        // Hash vehicle number to check uniqueness
        String vehicleNumberHash = encryptionService.hash(normalizedVehicleNumber);

        // Check if vehicle already exists
        if (vehicleRepository.existsByVehicleNumberHash(vehicleNumberHash)) {
            throw new DuplicateResourceException("Vehicle", "vehicle number", normalizedVehicleNumber);
        }

        // Get creator user
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdByUserId));

        // Encrypt and hash vehicle number and owner mobile
        EncryptionService.EncryptedData encryptedVehicleNumber = encryptionService.encryptAndHash(normalizedVehicleNumber);
        EncryptionService.EncryptedData encryptedOwnerMobile = encryptionService.encryptAndHash(request.getOwnerMobile());

        // Upload photos to GCS (if provided)
        String carImageUrl = null;
        String keyImageUrl = null;

        try {
            if (carImage != null && !carImage.isEmpty()) {
                carImageUrl = storageService.uploadFile(carImage, "vehicles/car");
                log.info("Car image uploaded: {}", carImageUrl);
            }

            if (keyImage != null && !keyImage.isEmpty()) {
                keyImageUrl = storageService.uploadFile(keyImage, "vehicles/key");
                log.info("Key image uploaded: {}", keyImageUrl);
            }
        } catch (IOException e) {
            log.error("Error uploading images: {}", e.getMessage(), e);
            // Clean up uploaded images if one fails
            if (carImageUrl != null) {
                storageService.deleteFile(carImageUrl);
            }
            throw e;
        }

        // Create vehicle
        Vehicle vehicle = Vehicle.builder()
                .ownerName(request.getOwnerName())
                .ownerMobile(encryptedOwnerMobile.encrypted())
                .ownerMobileHash(encryptedOwnerMobile.hash())
                .vehicleNumber(encryptedVehicleNumber.encrypted())
                .vehicleNumberHash(encryptedVehicleNumber.hash())
                .vehicleType(request.getVehicleType())
                .carImageUrl(carImageUrl)
                .keyImageUrl(keyImageUrl)
                .createdBy(createdBy)
                .active(true)
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle created with ID: {} by user: {}", savedVehicle.getId(), createdByUserId);

        // Audit log
        auditLogService.log(
                createdByUserId,
                "CREATE_VEHICLE",
                "VEHICLE",
                savedVehicle.getId().toString(),
                String.format("Registered vehicle: %s with photos", normalizedVehicleNumber)
        );

        return mapToResponse(savedVehicle);
    }

    /**
     * Update vehicle images
     */
    @Transactional
    public VehicleResponse updateVehicleImages(
            Long vehicleId,
            MultipartFile carImage,
            MultipartFile keyImage,
            Long userId
    ) throws IOException {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        // Upload new images and delete old ones
        if (carImage != null && !carImage.isEmpty()) {
            // Delete old image if exists
            if (vehicle.getCarImageUrl() != null) {
                storageService.deleteFile(vehicle.getCarImageUrl());
            }
            // Upload new image
            String newCarImageUrl = storageService.uploadFile(carImage, "vehicles/car");
            vehicle.setCarImageUrl(newCarImageUrl);
            log.info("Car image updated for vehicle ID: {}", vehicleId);
        }

        if (keyImage != null && !keyImage.isEmpty()) {
            // Delete old image if exists
            if (vehicle.getKeyImageUrl() != null) {
                storageService.deleteFile(vehicle.getKeyImageUrl());
            }
            // Upload new image
            String newKeyImageUrl = storageService.uploadFile(keyImage, "vehicles/key");
            vehicle.setKeyImageUrl(newKeyImageUrl);
            log.info("Key image updated for vehicle ID: {}", vehicleId);
        }

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // Audit log
        auditLogService.log(
                userId,
                "UPDATE_VEHICLE_IMAGES",
                "VEHICLE",
                vehicleId.toString(),
                "Updated vehicle images"
        );

        return mapToResponse(savedVehicle);
    }

    /**
     * Get all active vehicles
     */
    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search vehicles by partial vehicle number
     * Since data is encrypted, we decrypt all and filter in-memory
     */
    @Transactional(readOnly = true)
    public List<VehicleResponse> searchVehicles(String searchQuery) {
        String normalizedQuery = searchQuery.toUpperCase();

        return vehicleRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .filter(vehicle -> vehicle.getVehicleNumber().contains(normalizedQuery))
                .collect(Collectors.toList());
    }

    /**
     * Get vehicle by exact vehicle number
     */
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleByNumber(String vehicleNumber) {
        String normalizedVehicleNumber = vehicleNumber.toUpperCase();
        String vehicleNumberHash = encryptionService.hash(normalizedVehicleNumber);

        Vehicle vehicle = vehicleRepository.findByVehicleNumberHash(vehicleNumberHash)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "vehicle number", normalizedVehicleNumber));

        return mapToResponse(vehicle);
    }

    /**
     * Get vehicle entity by exact vehicle number (for internal use)
     */
    @Transactional(readOnly = true)
    public Vehicle getVehicleEntityByNumber(String vehicleNumber) {
        String normalizedVehicleNumber = vehicleNumber.toUpperCase();
        String vehicleNumberHash = encryptionService.hash(normalizedVehicleNumber);

        return vehicleRepository.findByVehicleNumberHash(vehicleNumberHash)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "vehicle number", normalizedVehicleNumber));
    }

    /**
     * Get vehicle by ID
     */
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        return mapToResponse(vehicle);
    }

    /**
     * Map Vehicle entity to VehicleResponse DTO
     */
    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .ownerName(vehicle.getOwnerName())
                .ownerMobile(encryptionService.decrypt(vehicle.getOwnerMobile()))
                .vehicleNumber(encryptionService.decrypt(vehicle.getVehicleNumber()))
                .vehicleType(vehicle.getVehicleType())
                .carImageUrl(vehicle.getCarImageUrl())
                .keyImageUrl(vehicle.getKeyImageUrl())
                .createdById(vehicle.getCreatedBy().getId())
                .createdByMobile(encryptionService.decrypt(vehicle.getCreatedBy().getMobileNumber()))
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
