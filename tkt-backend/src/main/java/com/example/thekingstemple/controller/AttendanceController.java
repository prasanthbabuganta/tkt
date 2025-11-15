package com.example.thekingstemple.controller;

import com.example.thekingstemple.dto.request.MarkArrivalRequest;
import com.example.thekingstemple.dto.response.ApiResponse;
import com.example.thekingstemple.dto.response.VehicleResponse;
import com.example.thekingstemple.dto.response.VisitResponse;
import com.example.thekingstemple.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for attendance/visit management
 */
@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Slf4j
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark-arrival")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<VisitResponse>> markArrival(
            @Valid @RequestBody MarkArrivalRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        log.info("User {} marking arrival for vehicle: {}", userId, request.getVehicleNumber());
        VisitResponse response = attendanceService.markArrival(request.getVehicleNumber(), userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Arrival marked successfully", response));
    }

    @GetMapping("/unmarked-today")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getUnmarkedVehiclesForToday() {
        log.info("Fetching unmarked vehicles for today");
        List<VehicleResponse> vehicles = attendanceService.getUnmarkedVehiclesForToday();
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    @GetMapping("/visits-today")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<VisitResponse>>> getVisitsForToday() {
        log.info("Fetching visits for today");
        List<VisitResponse> visits = attendanceService.getVisitsForToday();
        return ResponseEntity.ok(ApiResponse.success(visits));
    }

    @GetMapping("/visits/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<VisitResponse>>> getVisitsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        log.info("Fetching visits for date: {}", date);
        List<VisitResponse> visits = attendanceService.getVisitsForDate(date);
        return ResponseEntity.ok(ApiResponse.success(visits));
    }
}
