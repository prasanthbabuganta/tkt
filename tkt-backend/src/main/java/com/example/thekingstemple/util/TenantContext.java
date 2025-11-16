package com.example.thekingstemple.util;

/**
 * Thread-local storage for the current tenant ID
 * Used for schema-based multitenancy in PostgreSQL
 */
public class TenantContext {

    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        currentTenant.set(tenantId);
    }

    public static String getTenantId() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
