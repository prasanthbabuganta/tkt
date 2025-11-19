package com.example.thekingstemple.config;

import com.example.thekingstemple.util.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.cfg.AvailableSettings;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Resolves the current tenant identifier for Hibernate multitenancy
 */
@Component
@Slf4j
public class CurrentTenantIdentifierResolverImpl implements CurrentTenantIdentifierResolver<String>, HibernatePropertiesCustomizer {

    private static final String DEFAULT_TENANT = "public";

    @Override
    public String resolveCurrentTenantIdentifier() {
        String tenantId = TenantContext.getTenantId();
        String threadName = Thread.currentThread().getName();

        log.info("[HIBERNATE-TENANT-RESOLVER] resolveCurrentTenantIdentifier() called on thread: {}, TenantContext.getTenantId() = {}",
                threadName, tenantId);

        if (tenantId == null) {
            // During Spring initialization (repository setup), no tenant context is available.
            // Return default tenant to allow initialization to proceed.
            // Actual requests will have tenant context set via JwtAuthenticationFilter.
            log.info("[HIBERNATE-TENANT-RESOLVER] No tenant context set, using default tenant: {} on thread: {}",
                    DEFAULT_TENANT, threadName);
            return DEFAULT_TENANT;
        }

        log.info("[HIBERNATE-TENANT-RESOLVER] Resolved campus/tenant schema: {} for database query on thread: {}",
                tenantId, threadName);
        return tenantId;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, this);
    }
}
