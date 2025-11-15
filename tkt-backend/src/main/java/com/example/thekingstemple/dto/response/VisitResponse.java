package com.example.thekingstemple.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitResponse {
    private Long id;
    private VehicleResponse vehicle;
    private LocalDate visitDate;
    private LocalDateTime arrivedAt;
    private Long markedById;
    private String markedByMobile; // Decrypted
    private LocalDateTime createdAt;
}
