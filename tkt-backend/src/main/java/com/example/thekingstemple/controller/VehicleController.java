package com.example.thekingstemple.controller;

import com.example.thekingstemple.dto.request.CreateVehicleRequest;
import com.example.thekingstemple.dto.response.ApiResponse;
import com.example.thekingstemple.dto.response.VehicleResponse;
import com.example.thekingstemple.entity.VehicleType;
import com.example.thekingstemple.service.VehicleService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Controller for vehicle management
 */
@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@Slf4j
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(
            @RequestParam("ownerName") @Size(min = 2, max = 100) String ownerName,
            @RequestParam("ownerMobile") @Pattern(regexp = "^[0-9]{10}$") String ownerMobile,
            @RequestParam("vehicleNumber") @Pattern(regexp = "^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$") String vehicleNumber,
            @RequestParam("vehicleType") VehicleType vehicleType,
            @RequestParam(value = "carImage", required = false) MultipartFile carImage,
            @RequestParam(value = "keyImage", required = false) MultipartFile keyImage,
            @AuthenticationPrincipal Long userId
    ) {
        log.info("User {} creating new vehicle: {}", userId, vehicleNumber);

        // Create request object
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setOwnerName(ownerName);
        request.setOwnerMobile(ownerMobile);
        request.setVehicleNumber(vehicleNumber);
        request.setVehicleType(vehicleType);

        try {
            VehicleResponse response = vehicleService.createVehicleWithPhotos(
                    request, carImage, keyImage, userId
            );
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Vehicle registered successfully", response));
        } catch (IOException e) {
            log.error("Error uploading vehicle images: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload vehicle images"));
        }
    }

    @PutMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicleImages(
            @PathVariable Long id,
            @RequestParam(value = "carImage", required = false) MultipartFile carImage,
            @RequestParam(value = "keyImage", required = false) MultipartFile keyImage,
            @AuthenticationPrincipal Long userId
    ) {
        log.info("User {} updating images for vehicle ID: {}", userId, id);

        try {
            VehicleResponse response = vehicleService.updateVehicleImages(id, carImage, keyImage, userId);
            return ResponseEntity.ok(ApiResponse.success("Vehicle images updated successfully", response));
        } catch (IOException e) {
            log.error("Error updating vehicle images: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update vehicle images"));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        log.info("Fetching all vehicles");
        List<VehicleResponse> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> searchVehicles(
            @RequestParam String query
    ) {
        log.info("Searching vehicles with query: {}", query);
        List<VehicleResponse> vehicles = vehicleService.searchVehicles(query);
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        log.info("Fetching vehicle by ID: {}", id);
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success(vehicle));
    }

    @GetMapping("/by-number/{vehicleNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleByNumber(
            @PathVariable String vehicleNumber
    ) {
        log.info("Fetching vehicle by number: {}", vehicleNumber);
        VehicleResponse vehicle = vehicleService.getVehicleByNumber(vehicleNumber);
        return ResponseEntity.ok(ApiResponse.success(vehicle));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @RequestParam("ownerName") @Size(min = 2, max = 100) String ownerName,
            @RequestParam("ownerMobile") @Pattern(regexp = "^[0-9]{10}$") String ownerMobile,
            @RequestParam("vehicleNumber") @Pattern(regexp = "^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$") String vehicleNumber,
            @RequestParam("vehicleType") VehicleType vehicleType,
            @RequestParam(value = "carImage", required = false) MultipartFile carImage,
            @RequestParam(value = "keyImage", required = false) MultipartFile keyImage,
            @AuthenticationPrincipal Long userId
    ) {
        log.info("User {} updating vehicle ID: {}", userId, id);

        // Create request object
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setOwnerName(ownerName);
        request.setOwnerMobile(ownerMobile);
        request.setVehicleNumber(vehicleNumber);
        request.setVehicleType(vehicleType);

        try {
            VehicleResponse response = vehicleService.updateVehicleWithPhotos(id, request, carImage, keyImage, userId);
            return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", response));
        } catch (IOException e) {
            log.error("Error uploading vehicle images: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload vehicle images"));
        }
    }
}
