# The King's Temple - Vehicle Attendance Management System

A comprehensive backend API for managing vehicle registration and daily attendance tracking with secure encryption and JWT authentication.

## 🚀 Features

### Authentication & Security
- **JWT-based Authentication** with 30-day access tokens and refresh token support
- **BCrypt PIN Hashing** for secure credential storage
- **AES-256-GCM Encryption** for sensitive data (mobile numbers, vehicle numbers)
- **Role-based Access Control** (ADMIN and STAFF roles)
- **Hard-coded Admin Seed** on startup for initial access

### Vehicle Management
- Register vehicles with owner details
- Encrypted storage of vehicle numbers and mobile numbers
- Search vehicles by partial number (case-insensitive)
- Support for CAR and BIKE types
- Indian vehicle number format validation (e.g., KA01AB1234)

### Attendance/Visit Tracking
- Mark vehicle arrivals with timestamp
- Idempotent marking (prevents duplicate entries per day)
- Get unmarked vehicles for today
- View daily visits and historical records
- Automatic date-based filtering

### Reports
- Daily attendance reports with summary statistics
- Date-range queries for historical data
- Total arrivals, unmarked count, and vehicle details

### Audit & Logging
- Comprehensive audit trail for all actions
- Tracks who created vehicles and marked arrivals
- Asynchronous logging for performance

### Scheduler
- IST timezone-based midnight reset scheduler
- Optional cleanup tasks and report generation

## 🛠️ Tech Stack

- **Java 21**
- **Spring Boot 3.3.5**
- **PostgreSQL** (with encrypted fields)
- **Spring Security** with JWT
- **Spring Data JPA**
- **Lombok** for boilerplate reduction
- **Jakarta Validation** for input validation

## 📋 Prerequisites

- Java 21 or higher
- PostgreSQL 12 or higher
- Maven 3.9+

## 🔧 Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd The-Kings-Temple-Backend
```

### 2. Configure PostgreSQL Database

Create a PostgreSQL database:

```sql
CREATE DATABASE kings_temple_db;
```

### 3. Configure Application Properties

Update `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/kings_temple_db
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

# JWT Secret (IMPORTANT: Change in production!)
jwt.secret=YourSuperSecretKeyForJWTTokenGeneration...

# Encryption Key (IMPORTANT: Must be exactly 32 bytes for AES-256)
encryption.secret.key=12345678901234567890123456789012

# Admin Seed Credentials (IMPORTANT: Change in production!)
admin.seed.mobile=9133733197
admin.seed.pin=777777
```

⚠️ **SECURITY WARNING**:
- Change `jwt.secret` to a strong random string in production
- Change `encryption.secret.key` to a random 32-byte key in production
- Change admin credentials after first login
- Use environment variables for sensitive configuration

### 4. Build the Application

```bash
./mvnw clean package
```

### 5. Run the Application

```bash
./mvnw spring-boot:run
```

Or run the JAR:

```bash
java -jar target/thekingstemple-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080/api`

### 6. First Login

Use the seeded admin credentials:
- Mobile: `9133733197`
- PIN: `777777`

**Immediately change these credentials in production!**

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### 1. Login
```http
POST /auth/login
Content-Type: application/json

{
  "mobileNumber": "9133733197",
  "pin": "777777"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "tokenType": "Bearer",
    "expiresIn": 2592000000,
    "user": {
      "id": 1,
      "mobileNumber": "9133733197",
      "role": "ADMIN"
    }
  }
}
```

#### 2. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### User Management (Admin Only)

#### 3. Create User
```http
POST /users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "mobileNumber": "9876543210",
  "pin": "123456",
  "role": "STAFF"
}
```

#### 4. Get All Users
```http
GET /users
Authorization: Bearer <access_token>
```

### Vehicle Management

#### 5. Register Vehicle
```http
POST /vehicles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "ownerName": "John Doe",
  "ownerMobile": "9876543210",
  "vehicleNumber": "KA01AB1234",
  "vehicleType": "CAR"
}
```

**Vehicle Type Options:** `CAR`, `BIKE`

**Vehicle Number Format:** Indian registration format (e.g., KA01AB1234)

#### 6. Get All Vehicles
```http
GET /vehicles
Authorization: Bearer <access_token>
```

#### 7. Search Vehicles
```http
GET /vehicles/search?query=KA01
Authorization: Bearer <access_token>
```

#### 8. Get Vehicle by Number
```http
GET /vehicles/by-number/KA01AB1234
Authorization: Bearer <access_token>
```

### Attendance/Visit Management

#### 9. Mark Arrival
```http
POST /attendance/mark-arrival
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicleNumber": "KA01AB1234"
}
```

**Note:** Returns error if already marked for today (idempotent)

#### 10. Get Unmarked Vehicles for Today
```http
GET /attendance/unmarked-today
Authorization: Bearer <access_token>
```

Returns list of vehicles that haven't arrived yet today.

#### 11. Get Today's Visits
```http
GET /attendance/visits-today
Authorization: Bearer <access_token>
```

#### 12. Get Visits for Specific Date
```http
GET /attendance/visits/2025-11-14
Authorization: Bearer <access_token>
```

### Reports

#### 13. Get Today's Report
```http
GET /reports/daily
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-11-14",
    "totalArrivals": 15,
    "totalRegisteredVehicles": 20,
    "unmarkedCount": 5,
    "visits": [...]
  }
}
```

#### 14. Get Daily Report for Specific Date
```http
GET /reports/daily/2025-11-14
Authorization: Bearer <access_token>
```

#### 15. Get Visits in Date Range
```http
GET /reports/range?startDate=2025-11-01&endDate=2025-11-14
Authorization: Bearer <access_token>
```

## 🔒 Security Features

### Data Encryption
- **Vehicle Numbers**: Encrypted with AES-256-GCM before storage
- **Mobile Numbers**: Encrypted with AES-256-GCM before storage
- **Searchable Hashes**: SHA-256 hashes maintained for search functionality
- **PIN Storage**: BCrypt hashed with strength 12

### Authorization
- **Admin-only endpoints**: User creation, user listing
- **Protected endpoints**: All other APIs require authentication
- **Role-based access**: ADMIN and STAFF roles with different permissions

### Validation
- **Mobile Numbers**: Exactly 10 digits
- **PIN**: Exactly 6 digits (numeric only)
- **Vehicle Numbers**: Indian registration format validation
- **Input Sanitization**: All inputs validated with Jakarta Validation

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `mobile_number` (Encrypted)
- `mobile_hash` (SHA-256 for search)
- `pin_hash` (BCrypt)
- `role` (ADMIN/STAFF)
- `active` (Boolean)
- Timestamps

### Vehicles Table
- `id` (Primary Key)
- `owner_name`
- `owner_mobile` (Encrypted)
- `owner_mobile_hash` (SHA-256)
- `vehicle_number` (Encrypted)
- `vehicle_number_hash` (SHA-256 for uniqueness/search)
- `vehicle_type` (CAR/BIKE)
- `created_by_id` (Foreign Key → Users)
- Timestamps

### Visits Table
- `id` (Primary Key)
- `vehicle_id` (Foreign Key → Vehicles)
- `visit_date` (Date)
- `arrived_at` (Timestamp)
- `marked_by_id` (Foreign Key → Users)
- Unique constraint on (vehicle_id, visit_date)
- Timestamps

### Audit Logs Table
- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `action` (String)
- `entity_type` (String)
- `entity_id` (String)
- `details` (Text)
- `ip_address` (String)
- `timestamp`

## 🕐 Timezone Configuration

All date/time operations use **IST (Asia/Kolkata)** timezone:
- Midnight scheduler runs at 00:00 IST
- "Today" is calculated based on IST
- Visit timestamps stored in IST

## 🔄 Daily Reset Mechanism

The system uses a scheduler that runs at midnight IST:
- No data deletion occurs
- Previous day's visits remain in database
- "Unmarked vehicles" automatically resets because it queries by current date
- Optional: Can add cleanup tasks, report generation, etc.

## 🚨 Error Handling

All errors return standardized JSON responses:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-11-14T10:30:00"
}
```

Common error codes:
- `400` - Validation errors
- `401` - Invalid credentials / Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (duplicate vehicle, already marked today)
- `500` - Internal server error

## 📱 Expo Frontend Integration

### Authentication Flow
1. Login with mobile + PIN
2. Store access token and refresh token
3. Use access token in `Authorization: Bearer <token>` header
4. Refresh token when access token expires (30 days)

### Recommended Screens
1. **Login Screen**: Mobile number + PIN input
2. **Home/Dashboard**: Today's stats + quick actions
3. **Tick/Mark Attendance**: List of unmarked vehicles, mark arrival
4. **Vehicle Registration**: Form to add new vehicles
5. **Search Vehicles**: Search by partial number
6. **Reports**: Daily reports and date range queries
7. **User Management** (Admin only): Create staff accounts

### State Management Suggestions
- Store user info (id, mobile, role) in context
- Store tokens in secure storage (expo-secure-store)
- Implement token refresh interceptor
- Handle offline scenarios (queue marks for sync)

## 🔧 Production Deployment Checklist

- [ ] Change JWT secret to strong random value
- [ ] Change encryption key to random 32-byte key
- [ ] Change admin seed credentials
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly (don't use `*` in production)
- [ ] Set up proper PostgreSQL backups
- [ ] Configure logging and monitoring
- [ ] Implement rate limiting for login endpoint
- [ ] Review and update security settings
- [ ] Set up CI/CD pipeline
- [ ] Configure proper database connection pooling

## 📄 License

MIT License

## 👥 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ for The King's Temple**
