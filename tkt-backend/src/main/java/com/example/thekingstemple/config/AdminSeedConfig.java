package com.example.thekingstemple.config;

import com.example.thekingstemple.entity.Role;
import com.example.thekingstemple.entity.User;
import com.example.thekingstemple.repository.UserRepository;
import com.example.thekingstemple.service.EncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
            // Hash the admin mobile to check if already exists
            String mobileHash = encryptionService.hash(adminMobile);

            if (!userRepository.existsByMobileHash(mobileHash)) {
                // Encrypt and hash mobile
                EncryptionService.EncryptedData encryptedMobile = encryptionService.encryptAndHash(adminMobile);

                // Hash PIN with BCrypt
                String pinHash = passwordEncoder.encode(adminPin);

                // Create admin user
                User admin = User.builder()
                        .mobileNumber(encryptedMobile.encrypted())
                        .mobileHash(encryptedMobile.hash())
                        .pinHash(pinHash)
                        .role(Role.ADMIN)
                        .active(true)
                        .build();

                userRepository.save(admin);
                log.info("✅ Admin user seeded successfully with mobile: {}", adminMobile);
                log.info("⚠️  IMPORTANT: Change the default admin credentials in production!");
            } else {
                log.info("Admin user already exists, skipping seed");
            }
        };
    }
}
