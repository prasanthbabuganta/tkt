package com.example.thekingstemple.util;

import lombok.extern.slf4j.Slf4j;

/**
 * Thread-local storage for the current tenant ID
 * Used for schema-based multitenancy in PostgreSQL
 */
@Slf4j
public class TenantContext {

    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        String previousTenantId = currentTenant.get();
        currentTenant.set(tenantId);

        if (previousTenantId == null) {
            log.info("[TENANT-CONTEXT] Setting tenantId: {} on thread: {}",
                    tenantId, Thread.currentThread().getName());
        } else if (!previousTenantId.equals(tenantId)) {
            log.info("[TENANT-CONTEXT] Switching tenantId from: {} to: {} on thread: {}",
                    previousTenantId, tenantId, Thread.currentThread().getName());
        } else {
            log.debug("[TENANT-CONTEXT] TenantId already set to: {} on thread: {}",
                    tenantId, Thread.currentThread().getName());
        }
    }

    public static String getTenantId() {
        String tenantId = currentTenant.get();
        log.debug("[TENANT-CONTEXT] getTenantId() called on thread: {}, returning: {}",
                Thread.currentThread().getName(), tenantId);
        return tenantId;
    }

    public static void clear() {
        String tenantId = currentTenant.get();
        currentTenant.remove();
        if (tenantId != null) {
            log.info("[TENANT-CONTEXT] Clearing tenantId: {} from thread: {}",
                    tenantId, Thread.currentThread().getName());
        }
    }
}
