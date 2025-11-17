-- ================================================================
-- TKT Backend - Schema Initialization Script
-- Creates tenant schemas and tables for multitenancy
-- Run this script once to initialize the database
-- ================================================================

-- Create schemas for each campus (tenant)
CREATE SCHEMA IF NOT EXISTS east;
CREATE SCHEMA IF NOT EXISTS west;
CREATE SCHEMA IF NOT EXISTS north;
CREATE SCHEMA IF NOT EXISTS south;

-- Grant permissions
GRANT ALL ON SCHEMA east TO postgres;
GRANT ALL ON SCHEMA west TO postgres;
GRANT ALL ON SCHEMA north TO postgres;
GRANT ALL ON SCHEMA south TO postgres;

-- ================================================================
-- Create tables in EAST schema
-- ================================================================
SET search_path TO east;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(20) NOT NULL,
    mobile_number VARCHAR(500) NOT NULL,
    mobile_hash VARCHAR(64) NOT NULL UNIQUE,
    pin_hash VARCHAR(60) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mobile_hash ON users(mobile_hash);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_id ON users(tenant_id);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    owner_mobile VARCHAR(500) NOT NULL,
    owner_mobile_hash VARCHAR(64) NOT NULL,
    vehicle_number VARCHAR(500) NOT NULL,
    vehicle_number_hash VARCHAR(64) NOT NULL UNIQUE,
    vehicle_type VARCHAR(10) NOT NULL,
    created_by_id BIGINT NOT NULL REFERENCES users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    car_image_url VARCHAR(500),
    key_image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_number_hash ON vehicles(vehicle_number_hash);
CREATE INDEX IF NOT EXISTS idx_owner_mobile_hash ON vehicles(owner_mobile_hash);
CREATE INDEX IF NOT EXISTS idx_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_created_by ON vehicles(created_by_id);

CREATE TABLE IF NOT EXISTS visits (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    visit_date DATE NOT NULL,
    arrived_at TIMESTAMP NOT NULL,
    marked_by_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_vehicle_visit_date UNIQUE (vehicle_id, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_id ON visits(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_marked_by ON visits(marked_by_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_logs(timestamp);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    blacklisted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_token_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_expires_at ON token_blacklist(expires_at);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA east TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA east TO postgres;

-- ================================================================
-- Create tables in WEST schema
-- ================================================================
SET search_path TO west;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(20) NOT NULL,
    mobile_number VARCHAR(500) NOT NULL,
    mobile_hash VARCHAR(64) NOT NULL UNIQUE,
    pin_hash VARCHAR(60) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mobile_hash ON users(mobile_hash);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_id ON users(tenant_id);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    owner_mobile VARCHAR(500) NOT NULL,
    owner_mobile_hash VARCHAR(64) NOT NULL,
    vehicle_number VARCHAR(500) NOT NULL,
    vehicle_number_hash VARCHAR(64) NOT NULL UNIQUE,
    vehicle_type VARCHAR(10) NOT NULL,
    created_by_id BIGINT NOT NULL REFERENCES users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    car_image_url VARCHAR(500),
    key_image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_number_hash ON vehicles(vehicle_number_hash);
CREATE INDEX IF NOT EXISTS idx_owner_mobile_hash ON vehicles(owner_mobile_hash);
CREATE INDEX IF NOT EXISTS idx_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_created_by ON vehicles(created_by_id);

CREATE TABLE IF NOT EXISTS visits (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    visit_date DATE NOT NULL,
    arrived_at TIMESTAMP NOT NULL,
    marked_by_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_vehicle_visit_date UNIQUE (vehicle_id, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_id ON visits(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_marked_by ON visits(marked_by_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_logs(timestamp);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    blacklisted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_token_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_expires_at ON token_blacklist(expires_at);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA west TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA west TO postgres;

-- ================================================================
-- Create tables in NORTH schema
-- ================================================================
SET search_path TO north;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(20) NOT NULL,
    mobile_number VARCHAR(500) NOT NULL,
    mobile_hash VARCHAR(64) NOT NULL UNIQUE,
    pin_hash VARCHAR(60) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mobile_hash ON users(mobile_hash);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_id ON users(tenant_id);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    owner_mobile VARCHAR(500) NOT NULL,
    owner_mobile_hash VARCHAR(64) NOT NULL,
    vehicle_number VARCHAR(500) NOT NULL,
    vehicle_number_hash VARCHAR(64) NOT NULL UNIQUE,
    vehicle_type VARCHAR(10) NOT NULL,
    created_by_id BIGINT NOT NULL REFERENCES users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    car_image_url VARCHAR(500),
    key_image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_number_hash ON vehicles(vehicle_number_hash);
CREATE INDEX IF NOT EXISTS idx_owner_mobile_hash ON vehicles(owner_mobile_hash);
CREATE INDEX IF NOT EXISTS idx_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_created_by ON vehicles(created_by_id);

CREATE TABLE IF NOT EXISTS visits (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    visit_date DATE NOT NULL,
    arrived_at TIMESTAMP NOT NULL,
    marked_by_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_vehicle_visit_date UNIQUE (vehicle_id, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_id ON visits(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_marked_by ON visits(marked_by_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_logs(timestamp);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    blacklisted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_token_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_expires_at ON token_blacklist(expires_at);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA north TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA north TO postgres;

-- ================================================================
-- Create tables in SOUTH schema
-- ================================================================
SET search_path TO south;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(20) NOT NULL,
    mobile_number VARCHAR(500) NOT NULL,
    mobile_hash VARCHAR(64) NOT NULL UNIQUE,
    pin_hash VARCHAR(60) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mobile_hash ON users(mobile_hash);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_id ON users(tenant_id);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    owner_mobile VARCHAR(500) NOT NULL,
    owner_mobile_hash VARCHAR(64) NOT NULL,
    vehicle_number VARCHAR(500) NOT NULL,
    vehicle_number_hash VARCHAR(64) NOT NULL UNIQUE,
    vehicle_type VARCHAR(10) NOT NULL,
    created_by_id BIGINT NOT NULL REFERENCES users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    car_image_url VARCHAR(500),
    key_image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_number_hash ON vehicles(vehicle_number_hash);
CREATE INDEX IF NOT EXISTS idx_owner_mobile_hash ON vehicles(owner_mobile_hash);
CREATE INDEX IF NOT EXISTS idx_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_created_by ON vehicles(created_by_id);

CREATE TABLE IF NOT EXISTS visits (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    visit_date DATE NOT NULL,
    arrived_at TIMESTAMP NOT NULL,
    marked_by_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_vehicle_visit_date UNIQUE (vehicle_id, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_id ON visits(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_marked_by ON visits(marked_by_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_logs(timestamp);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    blacklisted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_token_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_expires_at ON token_blacklist(expires_at);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA south TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA south TO postgres;

-- Reset search path to default
SET search_path TO public;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Schema initialization completed!';
    RAISE NOTICE 'Created schemas: east, west, north, south';
    RAISE NOTICE 'Created tables in each schema: users, vehicles, visits, audit_logs, token_blacklist';
    RAISE NOTICE '========================================';
END $$;
