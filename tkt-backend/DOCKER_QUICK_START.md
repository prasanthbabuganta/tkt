# Docker Quick Start Guide

Quick guide to run TKT Backend locally using Docker.

## Prerequisites

- Docker Desktop installed and running
- 4GB RAM available
- Ports 8080, 5432, 5050 available

## Quick Start

### 1. Start All Services

```bash
# Start PostgreSQL + Application
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 2. Verify Services

```bash
# Check all containers are running
docker-compose ps

# Test health endpoint
curl http://localhost:8080/api/actuator/health
```

### 3. Test API

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9133733197",
    "pin": "777777"
  }'
```

**Create Vehicle:**
```bash
# First, save the access token from login response
TOKEN="your-access-token-here"

curl -X POST http://localhost:8080/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ownerName": "John Doe",
    "ownerMobile": "9876543210",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "CAR"
  }'
```

## With pgAdmin (Database UI)

### 1. Start with pgAdmin

```bash
docker-compose --profile with-pgadmin up -d
```

### 2. Access pgAdmin

- URL: http://localhost:5050
- Email: admin@tkt.local
- Password: admin

### 3. Connect to Database

In pgAdmin:
- Host: postgres
- Port: 5432
- Database: tkt
- Username: postgres
- Password: postgres

## Common Commands

### View Logs

```bash
# All logs
docker-compose logs -f

# Application only
docker-compose logs -f app

# PostgreSQL only
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs --tail=50 app
```

### Restart Services

```bash
# Restart application only
docker-compose restart app

# Restart all
docker-compose restart
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build app

# Force rebuild
docker-compose build --no-cache app
docker-compose up -d app
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v

# Stop without removing containers
docker-compose stop
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d tkt

# Backup database
docker-compose exec postgres pg_dump -U postgres tkt > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres tkt < backup.sql

# View database size
docker-compose exec postgres psql -U postgres -d tkt -c "\dt+"
```

## Environment Variables

You can override environment variables in `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: dev
      JWT_ACCESS_TOKEN_EXPIRY: 3600000  # 1 hour for testing
```

Or use `.env` file:

```bash
# Create .env file
cat > .env << EOF
SPRING_PROFILES_ACTIVE=dev
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=DevSecretKey123456789012345678901234567890
EOF

# Docker Compose will automatically load it
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8080
lsof -i :8080

# Change port in docker-compose.yml
services:
  app:
    ports:
      - "8081:8080"  # Use 8081 instead
```

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Verify PostgreSQL is healthy
docker-compose ps postgres

# Restart with fresh database
docker-compose down -v
docker-compose up -d
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker-compose exec postgres pg_isready

# Check network
docker network ls
docker network inspect tkt-backend_tkt-network

# Restart PostgreSQL
docker-compose restart postgres
```

### Out of Memory

```bash
# Increase Docker memory limit (Docker Desktop Settings)
# Or reduce application memory in docker-compose.yml
services:
  app:
    environment:
      JAVA_OPTS: "-Xms128m -Xmx256m"
```

## Development Workflow

### Hot Reload (Spring DevTools)

Spring Boot DevTools is enabled in development. Changes to code will trigger automatic restart.

1. Make code changes
2. Rebuild: `./mvnw clean package -DskipTests`
3. Restart container: `docker-compose restart app`

### Database Migrations

If you change entity classes:

```bash
# Let Hibernate update schema (ddl-auto=update)
docker-compose restart app

# Or manually run migration
docker-compose exec postgres psql -U postgres -d tkt -f /path/to/migration.sql
```

## Clean Up

### Remove Everything

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove Docker images
docker rmi $(docker images | grep tkt-backend)

# Remove unused Docker resources
docker system prune -a
```

### Fresh Start

```bash
# Complete clean slate
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Performance Tips

1. **Use volumes for faster builds:**
   - Maven cache is preserved between builds
   - No need to re-download dependencies

2. **Limit log output:**
   ```yaml
   logging:
     options:
       max-size: "10m"
       max-file: "3"
   ```

3. **Use multi-stage Dockerfile:**
   - Already configured
   - Smaller final image size

## Testing Different Profiles

### Development Profile

```bash
# Already default in docker-compose.yml
docker-compose up -d
```

### Production-like Profile

```bash
# Override in docker-compose
export SPRING_PROFILES_ACTIVE=prod
docker-compose up -d
```

Or create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: prod
      JWT_SECRET: ${JWT_SECRET}
      ENCRYPTION_SECRET_KEY: ${ENCRYPTION_SECRET_KEY}
```

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Health Checks

### Application Health

```bash
# Liveness probe
curl http://localhost:8080/api/actuator/health/liveness

# Readiness probe
curl http://localhost:8080/api/actuator/health/readiness

# Detailed health
curl http://localhost:8080/api/actuator/health
```

### Database Health

```bash
docker-compose exec postgres pg_isready -U postgres
```

## Useful Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias tkt-up='docker-compose up -d'
alias tkt-down='docker-compose down'
alias tkt-logs='docker-compose logs -f app'
alias tkt-restart='docker-compose restart app'
alias tkt-rebuild='docker-compose up -d --build app'
alias tkt-clean='docker-compose down -v && docker system prune -f'
alias tkt-psql='docker-compose exec postgres psql -U postgres -d tkt'
```

---

**Quick Reference:**

- API: http://localhost:8080/api
- Health: http://localhost:8080/api/actuator/health
- pgAdmin: http://localhost:5050
- Database: localhost:5432

**Default Credentials:**
- Admin Mobile: 9133733197
- Admin PIN: 777777
- DB User: postgres
- DB Pass: postgres
