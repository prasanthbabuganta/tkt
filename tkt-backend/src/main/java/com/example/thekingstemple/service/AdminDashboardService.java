package com.example.thekingstemple.service;

import com.example.thekingstemple.dto.response.CampusArrivalStats;
import com.example.thekingstemple.dto.response.MultiCampusDashboardResponse;
import com.example.thekingstemple.entity.VehicleType;
import com.example.thekingstemple.repository.VisitRepository;
import com.example.thekingstemple.util.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {

    private final VisitRepository visitRepository;

    /**
     * Get arrival stats for all campuses for a specific date
     * This method switches between tenant contexts to query each campus
     * Note: No @Transactional here to allow each campus query to use its own transaction
     */
    public MultiCampusDashboardResponse getMultiCampusDashboard(LocalDate date) {
        log.info("=== Starting multi-campus dashboard fetch for date: {} ===", date);

        // Store the original tenant context
        String originalTenant = TenantContext.getTenantId();
        log.debug("Original tenant context: {}", originalTenant);

        try {
            Map<String, CampusArrivalStats> campusStatsMap = new LinkedHashMap<>();

            // Define the campuses in order
            String[] campuses = {"east", "west", "north", "south"};

            // Query each campus
            for (String campus : campuses) {
                log.info("Processing campus: {}", campus);
                try {
                    // Query this campus (uses a new transaction for each campus)
                    CampusArrivalStats stats = queryCampusStats(campus, date);
                    campusStatsMap.put(campus, stats);

                    log.info("Campus {} - Bikes: {}, Cars: {}, Total: {}",
                             campus, stats.getBikesCount(), stats.getCarsCount(), stats.getTotalCount());

                } catch (Exception e) {
                    log.error("ERROR fetching data for campus: {} - Exception type: {}, Message: {}",
                             campus, e.getClass().getName(), e.getMessage(), e);
                    // Add empty stats for this campus in case of error
                    CampusArrivalStats emptyStats = CampusArrivalStats.builder()
                            .campusName(campus.substring(0, 1).toUpperCase() + campus.substring(1))
                            .bikesCount(0)
                            .carsCount(0)
                            .totalCount(0)
                            .build();
                    campusStatsMap.put(campus, emptyStats);
                }
            }

            log.info("Building final response with {} campus stats", campusStatsMap.size());
            MultiCampusDashboardResponse response = MultiCampusDashboardResponse.builder()
                    .date(date)
                    .campusStats(campusStatsMap)
                    .build();

            log.info("=== Successfully completed multi-campus dashboard fetch ===");
            return response;

        } catch (Exception e) {
            log.error("FATAL ERROR in getMultiCampusDashboard - Exception type: {}, Message: {}",
                     e.getClass().getName(), e.getMessage(), e);
            throw e;
        } finally {
            // Restore the original tenant context
            log.debug("Restoring original tenant context: {}", originalTenant);
            if (originalTenant != null) {
                TenantContext.setTenantId(originalTenant);
            } else {
                TenantContext.clear();
            }
            log.debug("Tenant context restored. Current tenant: {}", TenantContext.getTenantId());
        }
    }

    /**
     * Query stats for a single campus in its own transaction
     * REQUIRES_NEW forces a new transaction/connection for each call
     */
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    public CampusArrivalStats queryCampusStats(String campus, LocalDate date) {
        // Switch to the campus schema
        log.debug("Switching to tenant: {}", campus);
        TenantContext.setTenantId(campus);
        log.debug("Current tenant after switch: {}", TenantContext.getTenantId());

        // Get counts for bikes and cars
        log.debug("Querying bikes count for campus: {}, date: {}", campus, date);
        long bikesCount = visitRepository.countByVisitDateAndVehicleType(date, VehicleType.BIKE);
        log.debug("Bikes count: {}", bikesCount);

        log.debug("Querying cars count for campus: {}, date: {}", campus, date);
        long carsCount = visitRepository.countByVisitDateAndVehicleType(date, VehicleType.CAR);
        log.debug("Cars count: {}", carsCount);

        long totalCount = bikesCount + carsCount;

        // Build stats for this campus
        return CampusArrivalStats.builder()
                .campusName(campus.substring(0, 1).toUpperCase() + campus.substring(1)) // Capitalize
                .bikesCount(bikesCount)
                .carsCount(carsCount)
                .totalCount(totalCount)
                .build();
    }
}
