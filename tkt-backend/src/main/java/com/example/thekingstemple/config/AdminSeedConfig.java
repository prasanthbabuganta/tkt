package com.example.thekingstemple.config;

import com.example.thekingstemple.entity.Role;
import com.example.thekingstemple.entity.User;
import com.example.thekingstemple.repository.UserRepository;
import com.example.thekingstemple.service.EncryptionService;
import com.example.thekingstemple.util.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration to seed the admin user on application startup
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminSeedConfig {

    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.seed.mobile}")
    private String adminMobile;

    @Value("${admin.seed.pin}")
    private String adminPin;

    @Bean
    public CommandLineRunner seedAdminUser() {
        return args -> {
            // List of all tenants (campuses)
            List<String> tenants = Arrays.asList("east", "west", "north", "south");

            // Hash the admin mobile
            String mobileHash = encryptionService.hash(adminMobile);

            // Create admin user for each tenant
            for (String tenantId : tenants) {
                try {
                    // Set tenant context for this operation
                    TenantContext.setTenantId(tenantId);
                    log.info("[ADMIN-SEED] Set tenant context to: {} for admin user seeding", tenantId);

                    // Check if admin exists for this tenant
                    if (!userRepository.existsByMobileHashAndTenantId(mobileHash, tenantId)) {
                        // Encrypt and hash mobile
                        EncryptionService.EncryptedData encryptedMobile = encryptionService.encryptAndHash(adminMobile);

                        // Hash PIN with BCrypt
                        String pinHash = passwordEncoder.encode(adminPin);

                        // Create admin user for this tenant
                        User admin = User.builder()
                                .tenantId(tenantId)
                                .mobileNumber(encryptedMobile.encrypted())
                                .mobileHash(encryptedMobile.hash())
                                .pinHash(pinHash)
                                .role(Role.ADMIN)
                                .active(true)
                                .build();

                        userRepository.save(admin);
                        log.info("✅ Admin user seeded for campus '{}' with mobile: {}", tenantId, adminMobile);
                    } else {
                        log.info("Admin user for campus '{}' already exists, skipping seed", tenantId);
                    }
                } finally {
                    // Clear tenant context
                    log.info("[ADMIN-SEED] Clearing tenant context after processing tenant: {}", tenantId);
                    TenantContext.clear();
                }
            }

            log.info("⚠️  IMPORTANT: Change the default admin credentials in production!");
        };
    }
}
