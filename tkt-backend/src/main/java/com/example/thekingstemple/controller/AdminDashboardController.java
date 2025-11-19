package com.example.thekingstemple.controller;

import com.example.thekingstemple.dto.response.ApiResponse;
import com.example.thekingstemple.dto.response.MultiCampusDashboardResponse;
import com.example.thekingstemple.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * Get multi-campus dashboard with arrival stats for all campuses
     * Admin-only endpoint
     *
     * @param date Optional date parameter (defaults to today)
     * @return Dashboard data for all 4 campuses
     */
    @GetMapping("/multi-campus")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MultiCampusDashboardResponse>> getMultiCampusDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        log.info("=== Received admin dashboard request ===");
        log.info("Request date parameter: {}", date);

        try {
            // Default to today if no date provided
            LocalDate targetDate = (date != null) ? date : LocalDate.now();
            log.info("Target date (after default): {}", targetDate);

            log.info("Calling adminDashboardService.getMultiCampusDashboard()");
            MultiCampusDashboardResponse response = adminDashboardService.getMultiCampusDashboard(targetDate);
            log.info("Service call successful, building response");

            ApiResponse<MultiCampusDashboardResponse> apiResponse = ApiResponse.success(response);
            log.info("=== Returning successful response ===");

            return ResponseEntity.ok(apiResponse);

        } catch (Exception e) {
            log.error("=== ERROR in getMultiCampusDashboard controller ===");
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            log.error("Full stack trace:", e);
            throw e; // Re-throw to let GlobalExceptionHandler catch it
        }
    }
}
