package com.example.thekingstemple.dto.response;

import com.example.thekingstemple.entity.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private String ownerName;
    private String ownerMobile; // Decrypted
    private String vehicleNumber; // Decrypted
    private VehicleType vehicleType;
    private String carImageUrl;
    private String keyImageUrl;
    private Long createdById;
    private String createdByMobile; // Decrypted
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
