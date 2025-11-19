package com.example.thekingstemple.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampusArrivalStats {
    private String campusName;
    private long bikesCount;
    private long carsCount;
    private long totalCount;
}
