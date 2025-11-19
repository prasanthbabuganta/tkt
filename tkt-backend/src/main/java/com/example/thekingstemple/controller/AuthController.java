package com.example.thekingstemple.controller;

import com.example.thekingstemple.dto.request.LoginRequest;
import com.example.thekingstemple.dto.request.LogoutRequest;
import com.example.thekingstemple.dto.request.RefreshTokenRequest;
import com.example.thekingstemple.dto.response.ApiResponse;
import com.example.thekingstemple.dto.response.LoginResponse;
import com.example.thekingstemple.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller for authentication endpoints
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("=== LOGIN REQUEST === Mobile: {}, Campus/TenantId: {}",
                request.getMobileNumber(), request.getTenantId());
        LoginResponse response = authService.login(request);
        log.info("=== LOGIN SUCCESS === Campus/TenantId: {}, UserId: {}, Role: {}",
                request.getTenantId(), response.getUser().getId(), response.getUser().getRole());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request");
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            @RequestBody(required = false) LogoutRequest logoutRequest
    ) {
        // Extract access token from Authorization header
        String accessToken = getJwtFromRequest(request);

        // Extract refresh token from request body (if provided)
        String refreshToken = null;
        if (logoutRequest != null) {
            refreshToken = logoutRequest.getRefreshToken();
        }

        log.info("Logout request");
        authService.logout(accessToken, refreshToken);

        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
