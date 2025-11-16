-- ================================================================
-- PostgreSQL Schema Initialization for Multitenancy
-- Creates 4 schemas: east, west, north, south
-- Each schema represents a separate campus (tenant)
-- ================================================================

-- Create schemas for each tenant
CREATE SCHEMA IF NOT EXISTS east;
CREATE SCHEMA IF NOT EXISTS west;
CREATE SCHEMA IF NOT EXISTS north;
CREATE SCHEMA IF NOT EXISTS south;

-- Grant privileges on schemas
GRANT ALL PRIVILEGES ON SCHEMA east TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA west TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA north TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA south TO postgres;

-- Note: Table creation will be handled by Hibernate's DDL auto-update
-- Hibernate will create tables in each schema when TenantContext is set
-- This script only creates the schema structures

-- To manually create tables in each schema (if needed),
-- Hibernate will automatically handle this based on the entities

COMMENT ON SCHEMA east IS 'East Campus tenant schema';
COMMENT ON SCHEMA west IS 'West Campus tenant schema';
COMMENT ON SCHEMA north IS 'North Campus tenant schema';
COMMENT ON SCHEMA south IS 'South Campus tenant schema';
