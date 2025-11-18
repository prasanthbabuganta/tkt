package com.example.thekingstemple.config;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.cfg.AvailableSettings;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Provides database connections with the appropriate schema set for each tenant
 * Uses PostgreSQL schemas: east, west, north, south
 */
@Component
@Slf4j
public class SchemaBasedMultiTenantConnectionProvider implements MultiTenantConnectionProvider<String>, HibernatePropertiesCustomizer {

    private static final long serialVersionUID = 1L;
    private static final String DEFAULT_TENANT = "public";

    // Whitelist of allowed tenant schemas to prevent SQL injection
    private static final Set<String> ALLOWED_SCHEMAS = new HashSet<>(Arrays.asList(
            "east", "west", "north", "south", "public"
    ));

    @Autowired
    private DataSource dataSource;

    @Override
    public Connection getAnyConnection() throws SQLException {
        return dataSource.getConnection();
    }

    @Override
    public void releaseAnyConnection(Connection connection) throws SQLException {
        connection.close();
    }

    @Override
    public Connection getConnection(String tenantIdentifier) throws SQLException {
        final Connection connection = getAnyConnection();
        try {
            String schema = tenantIdentifier != null ? tenantIdentifier : DEFAULT_TENANT;

            // Validate schema name against whitelist to prevent SQL injection
            if (!ALLOWED_SCHEMAS.contains(schema)) {
                log.error("Attempted to access invalid tenant schema: {}. Allowed schemas: {}", schema, ALLOWED_SCHEMAS);
                throw new SQLException("Invalid tenant schema: " + schema + ". Schema must be one of: " + ALLOWED_SCHEMAS);
            }

            // Set the PostgreSQL schema for this connection
            try (Statement statement = connection.createStatement()) {
                statement.execute("SET search_path TO " + schema);
                log.debug("Successfully switched database schema to: {}", schema);
            }
        } catch (SQLException e) {
            log.error("Failed to set schema to {}: {}", tenantIdentifier, e.getMessage());
            throw new SQLException("Could not set schema to " + tenantIdentifier, e);
        }
        return connection;
    }

    @Override
    public void releaseConnection(String tenantIdentifier, Connection connection) throws SQLException {
        try {
            // Validate default schema (should always be valid, but defensive programming)
            if (!ALLOWED_SCHEMAS.contains(DEFAULT_TENANT)) {
                log.error("Invalid default schema: {}", DEFAULT_TENANT);
                throw new SQLException("Invalid default schema: " + DEFAULT_TENANT);
            }

            // Reset to default schema before releasing
            try (Statement statement = connection.createStatement()) {
                statement.execute("SET search_path TO " + DEFAULT_TENANT);
                log.debug("Reset schema to {} before releasing connection for tenant: {}", DEFAULT_TENANT, tenantIdentifier);
            }
        } catch (SQLException e) {
            // Log the error but don't fail the release
            log.error("Error resetting schema to default before releasing connection: {}", e.getMessage(), e);
        }
        connection.close();
    }

    @Override
    public boolean supportsAggressiveRelease() {
        return false;
    }

    @Override
    public boolean isUnwrappableAs(Class<?> unwrapType) {
        return MultiTenantConnectionProvider.class.isAssignableFrom(unwrapType);
    }

    @Override
    public <T> T unwrap(Class<T> unwrapType) {
        if (isUnwrappableAs(unwrapType)) {
            return unwrapType.cast(this);
        }
        throw new UnsupportedOperationException("Cannot unwrap to " + unwrapType);
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER, this);
    }
}
