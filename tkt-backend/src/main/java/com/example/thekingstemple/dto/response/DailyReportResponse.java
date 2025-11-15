package com.example.thekingstemple.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyReportResponse {
    private LocalDate date;
    private long totalArrivals;
    private long totalRegisteredVehicles;
    private long totalCars;
    private long totalBikes;
    private long unmarkedCount;
    private List<VisitResponse> visits;
}
