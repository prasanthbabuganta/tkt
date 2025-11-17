#!/bin/bash

# ================================================================
# TKT Backend - Database Initialization Script
# Initializes PostgreSQL schemas and tables for multitenancy
# ================================================================

set -e  # Exit on any error

echo "=========================================="
echo "TKT Database Initialization"
echo "=========================================="

# Database configuration
DB_NAME="${DB_NAME:-tkt}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Find psql command
PSQL_CMD=""

# Try common locations
if command -v psql &> /dev/null; then
    PSQL_CMD="psql"
elif [ -f "/usr/local/bin/psql" ]; then
    PSQL_CMD="/usr/local/bin/psql"
elif [ -f "/opt/homebrew/bin/psql" ]; then
    PSQL_CMD="/opt/homebrew/bin/psql"
elif [ -f "/usr/bin/psql" ]; then
    PSQL_CMD="/usr/bin/psql"
else
    # Try to find using mdfind (macOS Spotlight)
    PSQL_PATH=$(mdfind -name psql 2>/dev/null | grep -E "bin/psql$" | head -1)
    if [ -n "$PSQL_PATH" ]; then
        PSQL_CMD="$PSQL_PATH"
    fi
fi

if [ -z "$PSQL_CMD" ]; then
    echo "❌ Error: psql command not found!"
    echo ""
    echo "Please install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  Or use Docker: docker exec -i <container-name> psql -U $DB_USER -d $DB_NAME < src/main/resources/init-schemas.sql"
    exit 1
fi

echo "✓ Found psql: $PSQL_CMD"
echo ""
echo "Database Details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if database exists
echo "Checking database connection..."
if ! PGPASSWORD=$DB_PASSWORD $PSQL_CMD -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" &> /dev/null; then
    echo "❌ Error: Cannot connect to database '$DB_NAME'"
    echo "   Please ensure PostgreSQL is running and the database exists."
    echo "   You can create it with: createdb -U $DB_USER $DB_NAME"
    exit 1
fi

echo "✓ Successfully connected to database"
echo ""

# Run initialization script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INIT_SQL="$SCRIPT_DIR/src/main/resources/init-schemas.sql"

if [ ! -f "$INIT_SQL" ]; then
    echo "❌ Error: init-schemas.sql not found at $INIT_SQL"
    exit 1
fi

echo "Running schema initialization script..."
echo ""

PGPASSWORD=$DB_PASSWORD $PSQL_CMD -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$INIT_SQL"

echo ""
echo "=========================================="
echo "✅ Database initialization completed!"
echo "=========================================="
echo ""
echo "Created schemas: east, west, north, south"
echo "Created tables in each schema:"
echo "  - users"
echo "  - vehicles"
echo "  - visits"
echo "  - audit_logs"
echo "  - token_blacklist"
echo ""
echo "You can now start the application with:"
echo "  ./mvnw spring-boot:run"
echo ""
