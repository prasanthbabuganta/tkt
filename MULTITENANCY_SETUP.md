# Multitenancy Setup Guide

This guide explains how to set up and use the PostgreSQL schema-based multitenancy feature.

## Overview

The application now supports multitenancy using PostgreSQL schemas. Each tenant (campus) has its own schema with isolated data:

- **east** - East Campus
- **west** - West Campus
- **north** - North Campus
- **south** - South Campus

## Architecture

### Backend (Spring Boot)

1. **Schema-based Multitenancy**: Uses Hibernate's `SCHEMA` multitenancy strategy
2. **Tenant Context**: Thread-local storage for current tenant ID
3. **Schema Switching**: Automatic schema switching via `SET search_path` on each database connection
4. **JWT Integration**: Tenant ID is embedded in JWT tokens and extracted by authentication filter

### Mobile App (React Native)

1. **Campus Selection**: Dropdown picker on login screen
2. **Tenant Storage**: Tenant ID stored securely with auth tokens
3. **API Integration**: Tenant ID sent with login request

## Database Setup

### 1. Initialize PostgreSQL Schemas

Run the SQL script to create the 4 schemas:

```bash
cd tkt-backend
psql -U postgres -d tkt -f src/main/resources/db/init-schemas.sql
```

Or manually execute:

```sql
CREATE SCHEMA IF NOT EXISTS east;
CREATE SCHEMA IF NOT EXISTS west;
CREATE SCHEMA IF NOT EXISTS north;
CREATE SCHEMA IF NOT EXISTS south;
```

### 2. Automatic Table Creation

Hibernate will automatically create tables in each schema when:
- The application starts
- Admin users are seeded for each tenant
- First user logs in to a specific tenant

The `AdminSeedConfig` creates an admin user for all 4 tenants on startup.

## Backend Configuration

### Key Files Modified

1. **`User.java`**: Added `tenantId` field
2. **`TenantContext.java`**: Thread-local tenant storage
3. **`CurrentTenantIdentifierResolverImpl.java`**: Resolves current tenant for Hibernate
4. **`SchemaBasedMultiTenantConnectionProvider.java`**: Provides connections with correct schema
5. **`JwtTokenProvider.java`**: Includes tenant ID in JWT tokens
6. **`JwtAuthenticationFilter.java`**: Extracts tenant ID from JWT and sets context
7. **`AuthService.java`**: Handles tenant-aware authentication
8. **`AdminSeedConfig.java`**: Seeds admin users for all tenants

### application.properties

```properties
# Hibernate Multitenancy Configuration
spring.jpa.properties.hibernate.multiTenancy=SCHEMA
spring.jpa.properties.hibernate.tenant_identifier_resolver=com.example.thekingstemple.config.CurrentTenantIdentifierResolverImpl
spring.jpa.properties.hibernate.multi_tenant_connection_provider=com.example.thekingstemple.config.SchemaBasedMultiTenantConnectionProvider
```

## Mobile App Changes

### LoginScreen.js

Added Campus picker:

```javascript
<Picker
  selectedValue={campus}
  onValueChange={(itemValue) => setCampus(itemValue)}
>
  <Picker.Item label="East Campus" value="east" />
  <Picker.Item label="West Campus" value="west" />
  <Picker.Item label="North Campus" value="north" />
  <Picker.Item label="South Campus" value="south" />
</Picker>
```

### Required Dependency

Install the picker package:

```bash
cd tkt-mobile-app
npm install @react-native-picker/picker
```

## Testing the Multitenancy

### 1. Start the Backend

```bash
cd tkt-backend
./mvnw spring-boot:run
```

Check logs for admin user seeding:
```
✅ Admin user seeded for campus 'east' with mobile: 9133733197
✅ Admin user seeded for campus 'west' with mobile: 9133733197
✅ Admin user seeded for campus 'north' with mobile: 9133733197
✅ Admin user seeded for campus 'south' with mobile: 9133733197
```

### 2. Test Login for Different Campuses

Use the default admin credentials for each campus:
- **Mobile**: 9133733197
- **PIN**: 777777
- **Campus**: Select any (east, west, north, south)

### 3. Verify Data Isolation

1. Login to East Campus and create a vehicle
2. Logout and login to West Campus
3. The vehicle from East Campus should NOT appear in West Campus
4. Each campus has its own isolated data

### 4. Verify PostgreSQL Schemas

```sql
-- Connect to PostgreSQL
psql -U postgres -d tkt

-- List all schemas
\dn

-- Check tables in east schema
\dt east.*

-- Check users in east schema
SELECT id, mobile_hash, tenant_id, role FROM east.users;

-- Check users in west schema
SELECT id, mobile_hash, tenant_id, role FROM west.users;
```

## API Changes

### Login Request

**Before:**
```json
{
  "mobileNumber": "9133733197",
  "pin": "777777"
}
```

**After:**
```json
{
  "mobileNumber": "9133733197",
  "pin": "777777",
  "tenantId": "east"
}
```

### Login Response

**Before:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": 1,
    "mobileNumber": "9133733197",
    "role": "ADMIN"
  }
}
```

**After:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": 1,
    "mobileNumber": "9133733197",
    "role": "ADMIN",
    "tenantId": "east"
  }
}
```

## How It Works

### Request Flow

1. **Login**: User selects campus and submits credentials
2. **Authentication**: Backend validates credentials for specific tenant
3. **Token Generation**: JWT includes tenant ID as a claim
4. **Subsequent Requests**:
   - JWT filter extracts tenant ID from token
   - Sets `TenantContext.setTenantId(tenantId)`
   - Hibernate connection provider executes `SET search_path TO {tenantId}`
   - All queries run in tenant-specific schema
5. **Response**: Data returned from tenant's schema
6. **Cleanup**: `TenantContext.clear()` called after request

### Schema Isolation

Each schema contains identical table structures:
- users
- vehicles
- visits
- token_blacklist
- audit_log

Data in one schema is completely isolated from other schemas.

## Troubleshooting

### Issue: Admin user not seeded

**Solution**: Check application logs and ensure all schemas exist:
```sql
CREATE SCHEMA IF NOT EXISTS east;
CREATE SCHEMA IF NOT EXISTS west;
CREATE SCHEMA IF NOT EXISTS north;
CREATE SCHEMA IF NOT EXISTS south;
```

### Issue: Login fails with "Invalid credentials"

**Possible causes**:
1. Wrong campus selected
2. User doesn't exist in that campus's schema
3. Incorrect mobile number or PIN

**Solution**: Verify user exists in the correct schema:
```sql
SELECT * FROM east.users WHERE mobile_hash = 'hash_value';
```

### Issue: Tables not created in schemas

**Solution**:
1. Ensure `spring.jpa.hibernate.ddl-auto=update` in application.properties
2. Restart application to trigger Hibernate schema creation
3. Check database permissions

### Issue: Data appearing across tenants

**Solution**:
1. Verify `TenantContext` is being set correctly in `JwtAuthenticationFilter`
2. Check logs for "Set tenant context: {tenantId}"
3. Ensure JWT token contains tenant ID claim

## Security Considerations

1. **Tenant Isolation**: Users can only access data in their tenant's schema
2. **JWT Claims**: Tenant ID is stored in JWT and cannot be modified without invalidating the signature
3. **Authentication**: Each tenant has separate user authentication
4. **Schema Permissions**: Each schema has its own access controls

## Migration from Non-Multitenancy

If you have existing data in the `public` schema:

1. **Backup existing data**:
```bash
pg_dump -U postgres -d tkt > backup.sql
```

2. **Migrate data to tenant schemas**:
```sql
-- Example: Copy all data to east schema
INSERT INTO east.users SELECT * FROM public.users;
UPDATE east.users SET tenant_id = 'east';

-- Repeat for other schemas and tables
```

3. **Update existing user records** with tenant IDs

## Future Enhancements

Potential improvements:
1. Dynamic tenant creation via admin interface
2. Tenant-specific configuration (branding, settings)
3. Cross-tenant reporting for super admins
4. Tenant data export/import functionality
5. Tenant-specific file storage paths

## Support

For issues or questions, please refer to the main application documentation or contact the development team.
