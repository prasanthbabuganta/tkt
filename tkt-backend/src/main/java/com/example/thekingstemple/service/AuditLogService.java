package com.example.thekingstemple.service;

import com.example.thekingstemple.entity.AuditLog;
import com.example.thekingstemple.entity.User;
import com.example.thekingstemple.repository.AuditLogRepository;
import com.example.thekingstemple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for audit logging
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Create audit log asynchronously
     */
    @Async
    @Transactional
    public void log(Long userId, String action, String entityType, String entityId, String details, String ipAddress) {
        try {
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {} - {} - {}", action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to create audit log", e);
            // Don't throw exception - audit logging should not break the main flow
        }
    }

    /**
     * Simplified log method without IP
     */
    @Async
    @Transactional
    public void log(Long userId, String action, String entityType, String entityId, String details) {
        log(userId, action, entityType, entityId, details, null);
    }

    /**
     * Log without entity details
     */
    @Async
    @Transactional
    public void log(Long userId, String action) {
        log(userId, action, null, null, null, null);
    }
}
