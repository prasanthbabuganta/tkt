package com.example.thekingstemple.service;

import com.example.thekingstemple.dto.response.DailyReportResponse;
import com.example.thekingstemple.dto.response.VisitResponse;
import com.example.thekingstemple.repository.VehicleRepository;
import com.example.thekingstemple.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Service for generating reports
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final VisitRepository visitRepository;
    private final VehicleRepository vehicleRepository;
    private final AttendanceService attendanceService;

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    /**
     * Generate daily report for a specific date
     */
    @Transactional(readOnly = true)
    public DailyReportResponse getDailyReport(LocalDate date) {
        // Get all visits for the date
        List<VisitResponse> visits = attendanceService.getVisitsForDate(date);
        long totalArrivals = visits.size();

        // Get total registered vehicles
        long totalRegisteredVehicles = vehicleRepository.findByActiveTrueOrderByCreatedAtDesc().size();

        // Calculate unmarked count
        long unmarkedCount = totalRegisteredVehicles - totalArrivals;

        return DailyReportResponse.builder()
                .date(date)
                .totalArrivals(totalArrivals)
                .totalRegisteredVehicles(totalRegisteredVehicles)
                .unmarkedCount(unmarkedCount)
                .visits(visits)
                .build();
    }

    /**
     * Generate daily report for today
     */
    @Transactional(readOnly = true)
    public DailyReportResponse getTodayReport() {
        LocalDate today = LocalDate.now(IST_ZONE);
        return getDailyReport(today);
    }

    /**
     * Get visits in date range
     */
    @Transactional(readOnly = true)
    public List<VisitResponse> getVisitsInRange(LocalDate startDate, LocalDate endDate) {
        // Get visits for each date in the range
        return startDate.datesUntil(endDate.plusDays(1))
                .flatMap(date -> attendanceService.getVisitsForDate(date).stream())
                .toList();
    }
}
