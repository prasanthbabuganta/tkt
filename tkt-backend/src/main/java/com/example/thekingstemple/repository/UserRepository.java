package com.example.thekingstemple.repository;

import com.example.thekingstemple.entity.Role;
import com.example.thekingstemple.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by mobile hash (for login and uniqueness check)
     */
    Optional<User> findByMobileHash(String mobileHash);

    /**
     * Find user by mobile hash and tenant ID (for multitenancy)
     */
    Optional<User> findByMobileHashAndTenantId(String mobileHash, String tenantId);

    /**
     * Check if mobile hash exists
     */
    boolean existsByMobileHash(String mobileHash);

    /**
     * Check if mobile hash exists for a specific tenant
     */
    boolean existsByMobileHashAndTenantId(String mobileHash, String tenantId);

    /**
     * Find all users by role
     */
    List<User> findByRole(Role role);

    /**
     * Find all active users
     */
    List<User> findByActiveTrue();

    /**
     * Find active users by role
     */
    List<User> findByRoleAndActiveTrue(Role role);
}
