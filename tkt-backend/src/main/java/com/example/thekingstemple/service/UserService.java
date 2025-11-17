package com.example.thekingstemple.service;

import com.example.thekingstemple.dto.request.CreateUserRequest;
import com.example.thekingstemple.dto.response.UserResponse;
import com.example.thekingstemple.entity.Role;
import com.example.thekingstemple.entity.User;
import com.example.thekingstemple.exception.DuplicateResourceException;
import com.example.thekingstemple.exception.ResourceNotFoundException;
import com.example.thekingstemple.repository.UserRepository;
import com.example.thekingstemple.util.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    /**
     * Create new user (admin-only operation)
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request, Long createdByUserId) {
        String mobileHash = encryptionService.hash(request.getMobileNumber());

        // Check if mobile number already exists
        if (userRepository.existsByMobileHash(mobileHash)) {
            throw new DuplicateResourceException("User", "mobile number", request.getMobileNumber());
        }

        // Encrypt and hash mobile
        EncryptionService.EncryptedData encryptedMobile = encryptionService.encryptAndHash(request.getMobileNumber());

        // Hash PIN with BCrypt
        String pinHash = passwordEncoder.encode(request.getPin());

        // Get current tenant ID from context
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context is not set. Cannot create user without tenant.");
        }

        // Create user
        User user = User.builder()
                .mobileNumber(encryptedMobile.encrypted())
                .mobileHash(encryptedMobile.hash())
                .pinHash(pinHash)
                .role(request.getRole())
                .tenantId(tenantId)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created with ID: {} and role: {} for tenant: {}", savedUser.getId(), savedUser.getRole(), savedUser.getTenantId());

        // Audit log
        auditLogService.log(
                createdByUserId,
                "CREATE_USER",
                "USER",
                savedUser.getId().toString(),
                String.format("Created %s user", request.getRole())
        );

        return mapToResponse(savedUser);
    }

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToResponse(user);
    }

    /**
     * Get user by mobile hash
     */
    @Transactional(readOnly = true)
    public User getUserByMobileHash(String mobileHash) {
        return userRepository.findByMobileHash(mobileHash)
                .orElseThrow(() -> new ResourceNotFoundException("User", "mobile hash", mobileHash));
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRoleAndActiveTrue(role)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map User entity to UserResponse DTO
     */
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .mobileNumber(encryptionService.decrypt(user.getMobileNumber()))
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
