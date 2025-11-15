package com.example.thekingstemple.controller;

import com.example.thekingstemple.dto.response.ApiResponse;
import com.example.thekingstemple.dto.response.DailyReportResponse;
import com.example.thekingstemple.dto.response.VisitResponse;
import com.example.thekingstemple.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for reports
 */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<DailyReportResponse>> getTodayReport() {
        log.info("Fetching today's report");
        DailyReportResponse report = reportService.getTodayReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/daily/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<DailyReportResponse>> getDailyReport(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        log.info("Fetching daily report for date: {}", date);
        DailyReportResponse report = reportService.getDailyReport(date);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<VisitResponse>>> getVisitsInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        log.info("Fetching visits from {} to {}", startDate, endDate);
        List<VisitResponse> visits = reportService.getVisitsInRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(visits));
    }
}
