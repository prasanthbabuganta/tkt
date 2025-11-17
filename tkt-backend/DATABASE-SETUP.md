# Database Setup Guide

## Overview

This application uses PostgreSQL with schema-based multitenancy. Each campus (tenant) has its own schema with isolated tables.

## Tenant Schemas

- **east** - East campus
- **west** - West campus
- **north** - North campus
- **south** - South campus

## Initial Setup

### Method 1: Using the initialization script (Recommended)

```bash
# From the tkt-backend directory
./init-database.sh
```

This script will:
1. Detect your PostgreSQL installation
2. Create all tenant schemas
3. Create all tables in each schema
4. Set up proper permissions

### Method 2: Manual setup using psql

```bash
# From the tkt-backend directory
psql -U postgres -d tkt -f src/main/resources/init-schemas.sql
```

Or if you need to specify host and password:

```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d tkt -f src/main/resources/init-schemas.sql
```

## Database Structure

Each tenant schema contains the following tables:

- **users** - User accounts with roles (ADMIN, PARKING_ATTENDANT)
- **vehicles** - Vehicle registrations with encrypted data
- **visits** - Daily vehicle visit tracking
- **audit_logs** - Audit trail for all operations
- **token_blacklist** - Revoked JWT tokens

## Admin User Seeding

On application startup, an admin user is automatically created in each tenant schema:

- Mobile: `9133733197` (configurable via `ADMIN_SEED_MOBILE`)
- PIN: `777777` (configurable via `ADMIN_SEED_PIN`)

**Important:** Change these default credentials in production!

## Verifying Setup

Check that all schemas and tables are created:

```sql
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname IN ('east', 'west', 'north', 'south')
ORDER BY schemaname, tablename;
```

## Configuration

Key application properties for database:

```properties
# Database connection
spring.datasource.url=jdbc:postgresql://localhost:5432/tkt
spring.datasource.username=postgres
spring.datasource.password=postgres

# Hibernate multitenancy
spring.jpa.properties.hibernate.multiTenancy=SCHEMA
spring.jpa.hibernate.ddl-auto=validate
```

## Notes

- After initial setup, set `spring.jpa.hibernate.ddl-auto=validate` to prevent automatic schema changes
- Each tenant's data is completely isolated in its own schema
- The `public` schema is used as the default when no tenant is specified
- Tenant selection happens through the `TenantContext` thread-local variable
