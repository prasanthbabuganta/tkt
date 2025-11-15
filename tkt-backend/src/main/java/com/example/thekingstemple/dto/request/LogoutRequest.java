package com.example.thekingstemple.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogoutRequest {

    /**
     * Refresh token to blacklist (optional, can be null)
     */
    private String refreshToken;
}
