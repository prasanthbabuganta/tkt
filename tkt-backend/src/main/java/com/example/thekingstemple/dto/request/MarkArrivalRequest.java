package com.example.thekingstemple.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkArrivalRequest {

    @NotBlank(message = "Vehicle number is required")
    @Pattern(
            regexp = "^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$",
            message = "Vehicle number must follow Indian format (e.g., KA01AB1234)"
    )
    private String vehicleNumber;
}
