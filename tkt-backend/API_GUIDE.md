# The King's Temple - Complete API Guide for Frontend

## 📋 Table of Contents
- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
  - [Authentication](#1-authentication)
  - [User Management](#2-user-management-admin-only)
  - [Vehicle Management](#3-vehicle-management)
  - [Attendance/Visit Management](#4-attendancevisit-management)
  - [Reports](#5-reports)
- [Error Handling](#error-handling)
- [Frontend Implementation Guide](#frontend-implementation-guide)
- [Code Examples](#code-examples)

---

## Overview

**Backend URL:** `http://your-server:8080/api`
**Authentication:** JWT Bearer Token
**Content-Type:** `application/json`
**Timezone:** IST (Asia/Kolkata)

---

## Base Configuration

### Environment Variables (Frontend)
```javascript
// config.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api', // Change for production
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
```

### Default Admin Credentials (First Login)
```
Mobile: 9133733197
PIN: 777777
```
⚠️ **IMPORTANT:** Change these credentials immediately after first login!

---

## Authentication Flow

### Step-by-Step Authentication

1. **Initial Login**
   - User enters 10-digit mobile number + 6-digit PIN
   - Send POST to `/auth/login`
   - Receive access token (30 days) + refresh token (60 days)
   - Store both tokens securely

2. **Using Access Token**
   - Include in every API request: `Authorization: Bearer <access_token>`
   - Token contains user ID, role, and mobile hash

3. **Token Refresh**
   - When access token expires (30 days), use refresh token
   - Send POST to `/auth/refresh` with refresh token
   - Receive new access token (keep same refresh token)

4. **Logout**
   - Delete stored tokens from device
   - No backend endpoint needed (stateless JWT)

---

## API Endpoints

### 1. Authentication

#### 1.1. Login

**Endpoint:** `POST /auth/login`
**Authentication:** Not required
**Description:** Login with mobile number and PIN

**Request Body:**
```json
{
  "mobileNumber": "9133733197",
  "pin": "777777"
}
```

**Validation Rules:**
- `mobileNumber`: Required, exactly 10 digits, numeric only
- `pin`: Required, exactly 6 digits, numeric only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 2592000000,
    "user": {
      "id": 1,
      "mobileNumber": "9133733197",
      "role": "ADMIN"
    }
  },
  "timestamp": "2025-11-14T10:30:00"
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "mobileNumber": "Mobile number must be exactly 10 digits",
    "pin": "PIN must be exactly 6 digits"
  },
  "timestamp": "2025-11-14T10:30:00"
}
```

401 - Invalid Credentials:
```json
{
  "success": false,
  "message": "Invalid mobile number or PIN",
  "timestamp": "2025-11-14T10:30:00"
}
```

---

#### 1.2. Refresh Token

**Endpoint:** `POST /auth/refresh`
**Authentication:** Not required (uses refresh token)
**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 2592000000,
    "user": {
      "id": 1,
      "mobileNumber": "9133733197",
      "role": "ADMIN"
    }
  },
  "timestamp": "2025-11-14T10:30:00"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "timestamp": "2025-11-14T10:30:00"
}
```

---

### 2. User Management (Admin Only)

#### 2.1. Create User (Staff)

**Endpoint:** `POST /users`
**Authentication:** Required (Admin only)
**Description:** Create new staff or admin user

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "pin": "123456",
  "role": "STAFF"
}
```

**Field Options:**
- `role`: `"ADMIN"` or `"STAFF"`

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "mobileNumber": "9876543210",
    "role": "STAFF",
    "active": true,
    "createdAt": "2025-11-14T10:30:00",
    "updatedAt": "2025-11-14T10:30:00"
  },
  "timestamp": "2025-11-14T10:30:00"
}
```

**Error Responses:**

403 - Not Admin:
```json
{
  "success": false,
  "message": "Access denied. You don't have permission to access this resource.",
  "timestamp": "2025-11-14T10:30:00"
}
```

409 - Duplicate Mobile:
```json
{
  "success": false,
  "message": "User already exists with mobile number: '9876543210'",
  "timestamp": "2025-11-14T10:30:00"
}
```

---

#### 2.2. Get All Users

**Endpoint:** `GET /users`
**Authentication:** Required (Admin only)
**Description:** List all users in the system

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "mobileNumber": "9133733197",
      "role": "ADMIN",
      "active": true,
      "createdAt": "2025-11-14T08:00:00",
      "updatedAt": "2025-11-14T08:00:00"
    },
    {
      "id": 2,
      "mobileNumber": "9876543210",
      "role": "STAFF",
      "active": true,
      "createdAt": "2025-11-14T10:30:00",
      "updatedAt": "2025-11-14T10:30:00"
    }
  ],
  "timestamp": "2025-11-14T10:35:00"
}
```

---

#### 2.3. Get User by ID

**Endpoint:** `GET /users/{id}`
**Authentication:** Required (Admin only)
**Description:** Get specific user details

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "mobileNumber": "9876543210",
    "role": "STAFF",
    "active": true,
    "createdAt": "2025-11-14T10:30:00",
    "updatedAt": "2025-11-14T10:30:00"
  },
  "timestamp": "2025-11-14T10:35:00"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found with id: '5'",
  "timestamp": "2025-11-14T10:35:00"
}
```

---

### 3. Vehicle Management

#### 3.1. Register Vehicle

**Endpoint:** `POST /vehicles`
**Authentication:** Required (Admin or Staff)
**Description:** Register a new vehicle

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "ownerName": "Rajesh Kumar",
  "ownerMobile": "9876543210",
  "vehicleNumber": "KA01AB1234",
  "vehicleType": "CAR"
}
```

**Field Details:**
- `ownerName`: 2-100 characters
- `ownerMobile`: Exactly 10 digits
- `vehicleNumber`: Indian format (e.g., KA01AB1234, MH12CD5678, DL1CAB9999)
- `vehicleType`: `"CAR"` or `"BIKE"` (dropdown options for frontend)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Vehicle registered successfully",
  "data": {
    "id": 1,
    "ownerName": "Rajesh Kumar",
    "ownerMobile": "9876543210",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "CAR",
    "createdById": 2,
    "createdByMobile": "9876543210",
    "createdAt": "2025-11-14T10:30:00",
    "updatedAt": "2025-11-14T10:30:00"
  },
  "timestamp": "2025-11-14T10:30:00"
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "vehicleNumber": "Vehicle number must follow Indian format (e.g., KA01AB1234)",
    "ownerMobile": "Owner mobile number must be exactly 10 digits"
  },
  "timestamp": "2025-11-14T10:30:00"
}
```

409 - Duplicate Vehicle:
```json
{
  "success": false,
  "message": "Vehicle already exists with vehicle number: 'KA01AB1234'",
  "timestamp": "2025-11-14T10:30:00"
}
```

---

#### 3.2. Get All Vehicles

**Endpoint:** `GET /vehicles`
**Authentication:** Required (Admin or Staff)
**Description:** List all registered vehicles (decrypted data)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ownerName": "Rajesh Kumar",
      "ownerMobile": "9876543210",
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "CAR",
      "createdById": 2,
      "createdByMobile": "9876543210",
      "createdAt": "2025-11-14T10:30:00",
      "updatedAt": "2025-11-14T10:30:00"
    },
    {
      "id": 2,
      "ownerName": "Priya Sharma",
      "ownerMobile": "9123456789",
      "vehicleNumber": "KA02XY5678",
      "vehicleType": "BIKE",
      "createdById": 1,
      "createdByMobile": "9133733197",
      "createdAt": "2025-11-14T11:00:00",
      "updatedAt": "2025-11-14T11:00:00"
    }
  ],
  "timestamp": "2025-11-14T12:00:00"
}
```

**Note:** All vehicle numbers and mobile numbers are decrypted for frontend display.

---

#### 3.3. Search Vehicles

**Endpoint:** `GET /vehicles/search?query={searchQuery}`
**Authentication:** Required (Admin or Staff)
**Description:** Search vehicles by partial vehicle number (case-insensitive)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `query`: Search string (e.g., "KA01", "AB12", "1234")

**Example Request:**
```
GET /vehicles/search?query=KA01
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ownerName": "Rajesh Kumar",
      "ownerMobile": "9876543210",
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "CAR",
      "createdById": 2,
      "createdByMobile": "9876543210",
      "createdAt": "2025-11-14T10:30:00",
      "updatedAt": "2025-11-14T10:30:00"
    },
    {
      "id": 3,
      "ownerName": "Amit Patel",
      "ownerMobile": "9998887776",
      "vehicleNumber": "KA01CD9999",
      "vehicleType": "CAR",
      "createdById": 1,
      "createdByMobile": "9133733197",
      "createdAt": "2025-11-14T11:30:00",
      "updatedAt": "2025-11-14T11:30:00"
    }
  ],
  "timestamp": "2025-11-14T12:00:00"
}
```

**Use Case:** Autocomplete, typeahead search as user types vehicle number

---

#### 3.4. Get Vehicle by Number

**Endpoint:** `GET /vehicles/by-number/{vehicleNumber}`
**Authentication:** Required (Admin or Staff)
**Description:** Get exact vehicle details by vehicle number

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```
GET /vehicles/by-number/KA01AB1234
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ownerName": "Rajesh Kumar",
    "ownerMobile": "9876543210",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "CAR",
    "createdById": 2,
    "createdByMobile": "9876543210",
    "createdAt": "2025-11-14T10:30:00",
    "updatedAt": "2025-11-14T10:30:00"
  },
  "timestamp": "2025-11-14T12:00:00"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Vehicle not found with vehicle number: 'KA99ZZ9999'",
  "timestamp": "2025-11-14T12:00:00"
}
```

---

#### 3.5. Get Vehicle by ID

**Endpoint:** `GET /vehicles/{id}`
**Authentication:** Required (Admin or Staff)
**Description:** Get vehicle details by database ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ownerName": "Rajesh Kumar",
    "ownerMobile": "9876543210",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "CAR",
    "createdById": 2,
    "createdByMobile": "9876543210",
    "createdAt": "2025-11-14T10:30:00",
    "updatedAt": "2025-11-14T10:30:00"
  },
  "timestamp": "2025-11-14T12:00:00"
}
```

---

### 4. Attendance/Visit Management

#### 4.1. Mark Arrival (Tick)

**Endpoint:** `POST /attendance/mark-arrival`
**Authentication:** Required (Admin or Staff)
**Description:** Mark a vehicle's arrival for today

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "vehicleNumber": "KA01AB1234"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Arrival marked successfully",
  "data": {
    "id": 1,
    "vehicle": {
      "id": 1,
      "ownerName": "Rajesh Kumar",
      "ownerMobile": "9876543210",
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "CAR",
      "createdById": 2,
      "createdByMobile": "9876543210",
      "createdAt": "2025-11-14T10:30:00",
      "updatedAt": "2025-11-14T10:30:00"
    },
    "visitDate": "2025-11-14",
    "arrivedAt": "2025-11-14T09:15:30",
    "markedById": 2,
    "markedByMobile": "9876543210",
    "createdAt": "2025-11-14T09:15:30"
  },
  "timestamp": "2025-11-14T09:15:30"
}
```

**Error Responses:**

404 - Vehicle Not Found:
```json
{
  "success": false,
  "message": "Vehicle not found with vehicle number: 'KA99ZZ9999'",
  "timestamp": "2025-11-14T09:15:30"
}
```

409 - Already Marked Today:
```json
{
  "success": false,
  "message": "Vehicle KA01AB1234 has already been marked for date: 2025-11-14",
  "timestamp": "2025-11-14T09:15:30"
}
```

**Important:** This is idempotent - can't mark same vehicle twice on same day

---

#### 4.2. Get Unmarked Vehicles for Today

**Endpoint:** `GET /attendance/unmarked-today`
**Authentication:** Required (Admin or Staff)
**Description:** Get list of vehicles that haven't arrived today (for tick screen)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "ownerName": "Priya Sharma",
      "ownerMobile": "9123456789",
      "vehicleNumber": "KA02XY5678",
      "vehicleType": "BIKE",
      "createdById": 1,
      "createdByMobile": "9133733197",
      "createdAt": "2025-11-14T11:00:00",
      "updatedAt": "2025-11-14T11:00:00"
    },
    {
      "id": 3,
      "ownerName": "Amit Patel",
      "ownerMobile": "9998887776",
      "vehicleNumber": "KA01CD9999",
      "vehicleType": "CAR",
      "createdById": 1,
      "createdByMobile": "9133733197",
      "createdAt": "2025-11-14T11:30:00",
      "updatedAt": "2025-11-14T11:30:00"
    }
  ],
  "timestamp": "2025-11-14T12:00:00"
}
```

**Use Case:** Display this list in the tick/attendance screen. After marking arrival, vehicle disappears from this list immediately.

---

#### 4.3. Get Today's Visits

**Endpoint:** `GET /attendance/visits-today`
**Authentication:** Required (Admin or Staff)
**Description:** Get all vehicles that arrived today

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vehicle": {
        "id": 1,
        "ownerName": "Rajesh Kumar",
        "ownerMobile": "9876543210",
        "vehicleNumber": "KA01AB1234",
        "vehicleType": "CAR",
        "createdById": 2,
        "createdByMobile": "9876543210",
        "createdAt": "2025-11-14T10:30:00",
        "updatedAt": "2025-11-14T10:30:00"
      },
      "visitDate": "2025-11-14",
      "arrivedAt": "2025-11-14T09:15:30",
      "markedById": 2,
      "markedByMobile": "9876543210",
      "createdAt": "2025-11-14T09:15:30"
    },
    {
      "id": 2,
      "vehicle": {
        "id": 4,
        "ownerName": "Suresh Reddy",
        "ownerMobile": "9111222333",
        "vehicleNumber": "TN10AB1111",
        "vehicleType": "CAR",
        "createdById": 1,
        "createdByMobile": "9133733197",
        "createdAt": "2025-11-13T08:00:00",
        "updatedAt": "2025-11-13T08:00:00"
      },
      "visitDate": "2025-11-14",
      "arrivedAt": "2025-11-14T10:30:45",
      "markedById": 1,
      "markedByMobile": "9133733197",
      "createdAt": "2025-11-14T10:30:45"
    }
  ],
  "timestamp": "2025-11-14T12:00:00"
}
```

---

#### 4.4. Get Visits for Specific Date

**Endpoint:** `GET /attendance/visits/{date}`
**Authentication:** Required (Admin or Staff)
**Description:** Get all visits for a specific date (historical data)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `date`: ISO date format (YYYY-MM-DD), e.g., `2025-11-13`

**Example Request:**
```
GET /attendance/visits/2025-11-13
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "vehicle": {
        "id": 1,
        "ownerName": "Rajesh Kumar",
        "ownerMobile": "9876543210",
        "vehicleNumber": "KA01AB1234",
        "vehicleType": "CAR",
        "createdById": 2,
        "createdByMobile": "9876543210",
        "createdAt": "2025-11-14T10:30:00",
        "updatedAt": "2025-11-14T10:30:00"
      },
      "visitDate": "2025-11-13",
      "arrivedAt": "2025-11-13T08:45:20",
      "markedById": 1,
      "markedByMobile": "9133733197",
      "createdAt": "2025-11-13T08:45:20"
    }
  ],
  "timestamp": "2025-11-14T12:00:00"
}
```

---

### 5. Reports

#### 5.1. Get Today's Report

**Endpoint:** `GET /reports/daily`
**Authentication:** Required (Admin or Staff)
**Description:** Get comprehensive daily report for today

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2025-11-14",
    "totalArrivals": 15,
    "totalRegisteredVehicles": 20,
    "unmarkedCount": 5,
    "visits": [
      {
        "id": 1,
        "vehicle": {
          "id": 1,
          "ownerName": "Rajesh Kumar",
          "ownerMobile": "9876543210",
          "vehicleNumber": "KA01AB1234",
          "vehicleType": "CAR",
          "createdById": 2,
          "createdByMobile": "9876543210",
          "createdAt": "2025-11-14T10:30:00",
          "updatedAt": "2025-11-14T10:30:00"
        },
        "visitDate": "2025-11-14",
        "arrivedAt": "2025-11-14T09:15:30",
        "markedById": 2,
        "markedByMobile": "9876543210",
        "createdAt": "2025-11-14T09:15:30"
      }
      // ... more visits
    ]
  },
  "timestamp": "2025-11-14T12:00:00"
}
```

**Fields Explanation:**
- `totalArrivals`: Number of vehicles that arrived today
- `totalRegisteredVehicles`: Total vehicles in system
- `unmarkedCount`: Vehicles that haven't arrived yet today
- `visits`: Array of all today's visits with full details

---

#### 5.2. Get Daily Report for Specific Date

**Endpoint:** `GET /reports/daily/{date}`
**Authentication:** Required (Admin or Staff)
**Description:** Get daily report for any historical date

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `date`: ISO date format (YYYY-MM-DD)

**Example Request:**
```
GET /reports/daily/2025-11-13
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2025-11-13",
    "totalArrivals": 18,
    "totalRegisteredVehicles": 20,
    "unmarkedCount": 2,
    "visits": [
      // Array of visits for 2025-11-13
    ]
  },
  "timestamp": "2025-11-14T12:00:00"
}
```

---

#### 5.3. Get Visits in Date Range

**Endpoint:** `GET /reports/range?startDate={start}&endDate={end}`
**Authentication:** Required (Admin or Staff)
**Description:** Get all visits between two dates

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `startDate`: ISO date format (YYYY-MM-DD)
- `endDate`: ISO date format (YYYY-MM-DD)

**Example Request:**
```
GET /reports/range?startDate=2025-11-01&endDate=2025-11-14
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 50,
      "vehicle": {
        "id": 1,
        "ownerName": "Rajesh Kumar",
        "ownerMobile": "9876543210",
        "vehicleNumber": "KA01AB1234",
        "vehicleType": "CAR",
        "createdById": 2,
        "createdByMobile": "9876543210",
        "createdAt": "2025-11-14T10:30:00",
        "updatedAt": "2025-11-14T10:30:00"
      },
      "visitDate": "2025-11-14",
      "arrivedAt": "2025-11-14T09:15:30",
      "markedById": 2,
      "markedByMobile": "9876543210",
      "createdAt": "2025-11-14T09:15:30"
    },
    {
      "id": 49,
      "vehicle": {
        "id": 1,
        "ownerName": "Rajesh Kumar",
        "ownerMobile": "9876543210",
        "vehicleNumber": "KA01AB1234",
        "vehicleType": "CAR",
        "createdById": 2,
        "createdByMobile": "9876543210",
        "createdAt": "2025-11-14T10:30:00",
        "updatedAt": "2025-11-14T10:30:00"
      },
      "visitDate": "2025-11-13",
      "arrivedAt": "2025-11-13T08:45:20",
      "markedById": 1,
      "markedByMobile": "9133733197",
      "createdAt": "2025-11-13T08:45:20"
    }
    // ... more visits
  ],
  "timestamp": "2025-11-14T12:00:00"
}
```

**Note:** Results are sorted by date descending (newest first)

---

## Error Handling

### Standard Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-11-14T12:00:00"
}
```

For validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "fieldName1": "Error message 1",
    "fieldName2": "Error message 2"
  },
  "timestamp": "2025-11-14T12:00:00"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Data retrieved successfully |
| 201 | Created | Vehicle registered, arrival marked |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Invalid credentials, missing token |
| 403 | Forbidden | Not admin, insufficient permissions |
| 404 | Not Found | Vehicle not found, user not found |
| 409 | Conflict | Duplicate vehicle, already marked today |
| 500 | Server Error | Unexpected server error |

### Common Error Scenarios

#### 1. Token Expired (401)
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "timestamp": "2025-11-14T12:00:00"
}
```
**Action:** Redirect to login screen

#### 2. Missing Authorization Header (401)
**Action:** Check if token is being sent in headers

#### 3. Already Marked Today (409)
```json
{
  "success": false,
  "message": "Vehicle KA01AB1234 has already been marked for date: 2025-11-14",
  "timestamp": "2025-11-14T12:00:00"
}
```
**Action:** Show user-friendly message, remove from unmarked list

#### 4. Vehicle Not Found (404)
```json
{
  "success": false,
  "message": "Vehicle not found with vehicle number: 'KA99ZZ9999'",
  "timestamp": "2025-11-14T12:00:00"
}
```
**Action:** Prompt user to register vehicle first

---

## Frontend Implementation Guide

### Recommended App Structure (Expo/React Native)

```
/screens
  - LoginScreen.js
  - DashboardScreen.js
  - TickAttendanceScreen.js
  - VehicleRegistrationScreen.js
  - VehicleSearchScreen.js
  - ReportsScreen.js
  - UserManagementScreen.js (Admin only)

/services
  - api.js (API client with interceptors)
  - auth.js (Authentication logic)
  - storage.js (Secure token storage)

/contexts
  - AuthContext.js (Global auth state)

/components
  - VehicleCard.js
  - VisitCard.js
  - ErrorMessage.js
```

### State Management Recommendations

#### Using Context API

```javascript
// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    const storedAccessToken = await SecureStore.getItemAsync('accessToken');
    const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
    const storedUser = await SecureStore.getItemAsync('user');

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  };

  const login = async (mobileNumber, pin) => {
    // Call login API
    // Store tokens and user data
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Recommended Screen Flow

1. **Login Screen**
   - Input: 10-digit mobile, 6-digit PIN
   - On success: Store tokens, navigate to Dashboard

2. **Dashboard Screen**
   - Show today's stats (from `/reports/daily`)
   - Quick actions: Mark Attendance, Register Vehicle

3. **Tick/Attendance Screen**
   - Fetch unmarked vehicles (`/attendance/unmarked-today`)
   - Display list with search/filter
   - Mark arrival button for each vehicle
   - Auto-refresh after marking

4. **Vehicle Registration Screen**
   - Form: Owner Name, Mobile, Vehicle Number, Type (dropdown)
   - Validate vehicle number format
   - Show success message

5. **Search Screen**
   - Live search as user types (`/vehicles/search?query=...`)
   - Show vehicle details
   - Option to mark arrival from here

6. **Reports Screen**
   - Date picker for selecting report date
   - Display daily stats
   - Show visit history

### Important Frontend Tips

#### 1. Token Refresh Interceptor
```javascript
// api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://your-server:8080/api',
  timeout: 30000,
});

// Request interceptor - Add token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const response = await axios.post('http://your-server:8080/api/auth/refresh', {
          refreshToken
        });

        const { accessToken } = response.data.data;
        await SecureStore.setItemAsync('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // Navigate to login screen
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

#### 2. Vehicle Number Input Validation
```javascript
const validateVehicleNumber = (number) => {
  const pattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/;
  return pattern.test(number);
};

// Auto-uppercase as user types
const handleVehicleNumberChange = (text) => {
  setVehicleNumber(text.toUpperCase());
};
```

#### 3. Debounced Search
```javascript
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

const searchVehicles = debounce(async (query) => {
  if (query.length < 2) return;

  try {
    const response = await api.get(`/vehicles/search?query=${query}`);
    setSearchResults(response.data.data);
  } catch (error) {
    console.error(error);
  }
}, 500);

useEffect(() => {
  searchVehicles(searchQuery);
}, [searchQuery]);
```

#### 4. Error Handling
```javascript
const markArrival = async (vehicleNumber) => {
  try {
    const response = await api.post('/attendance/mark-arrival', { vehicleNumber });

    // Success
    Alert.alert('Success', 'Arrival marked successfully');
    refreshUnmarkedList();

  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 409) {
        // Already marked
        Alert.alert('Already Marked', data.message);
      } else if (status === 404) {
        // Vehicle not found
        Alert.alert('Not Found', 'Vehicle not registered. Please register first.');
      } else {
        // Other errors
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } else {
      // Network error
      Alert.alert('Network Error', 'Please check your internet connection');
    }
  }
};
```

---

## Code Examples

### Complete Login Implementation

```javascript
// LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

const LoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setAccessToken, setRefreshToken } = useContext(AuthContext);

  const handleLogin = async () => {
    // Validation
    if (mobileNumber.length !== 10) {
      Alert.alert('Error', 'Mobile number must be 10 digits');
      return;
    }
    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        mobileNumber,
        pin
      });

      const { accessToken, refreshToken, user } = response.data.data;

      // Store tokens securely
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      // Update context
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);

      // Navigate to dashboard
      navigation.replace('Dashboard');

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          Alert.alert('Login Failed', 'Invalid mobile number or PIN');
        } else if (status === 400) {
          // Validation errors
          const errors = data.data;
          const errorMessage = Object.values(errors).join('\n');
          Alert.alert('Validation Error', errorMessage);
        } else {
          Alert.alert('Error', data.message || 'Login failed');
        }
      } else {
        Alert.alert('Network Error', 'Please check your internet connection');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Mobile Number (10 digits)"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="number-pad"
        maxLength={10}
      />

      <TextInput
        placeholder="PIN (6 digits)"
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
};

export default LoginScreen;
```

### Complete Mark Arrival Implementation

```javascript
// TickAttendanceScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Button, Alert, RefreshControl } from 'react-native';
import api from '../services/api';

const TickAttendanceScreen = () => {
  const [unmarkedVehicles, setUnmarkedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUnmarkedVehicles();
  }, []);

  const fetchUnmarkedVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/unmarked-today');
      setUnmarkedVehicles(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkArrival = async (vehicleNumber) => {
    try {
      await api.post('/attendance/mark-arrival', { vehicleNumber });

      Alert.alert('Success', 'Arrival marked successfully');

      // Remove from unmarked list immediately
      setUnmarkedVehicles(prev =>
        prev.filter(v => v.vehicleNumber !== vehicleNumber)
      );

    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert('Already Marked', 'This vehicle has already been marked today');
        // Refresh list to sync
        fetchUnmarkedVehicles();
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to mark arrival');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUnmarkedVehicles();
    setRefreshing(false);
  };

  const renderVehicle = ({ item }) => (
    <View style={{ padding: 15, borderBottomWidth: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.vehicleNumber}</Text>
      <Text>{item.ownerName}</Text>
      <Text>{item.vehicleType}</Text>
      <Button
        title="Mark Arrival"
        onPress={() => handleMarkArrival(item.vehicleNumber)}
      />
    </View>
  );

  return (
    <FlatList
      data={unmarkedVehicles}
      renderItem={renderVehicle}
      keyExtractor={item => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          All vehicles marked for today! 🎉
        </Text>
      }
    />
  );
};

export default TickAttendanceScreen;
```

### Complete Vehicle Registration Implementation

```javascript
// VehicleRegistrationScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Picker } from 'react-native';
import api from '../services/api';

const VehicleRegistrationScreen = ({ navigation }) => {
  const [ownerName, setOwnerName] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (ownerName.length < 2) {
      Alert.alert('Error', 'Owner name must be at least 2 characters');
      return false;
    }
    if (ownerMobile.length !== 10) {
      Alert.alert('Error', 'Mobile number must be 10 digits');
      return false;
    }
    if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/.test(vehicleNumber)) {
      Alert.alert('Error', 'Invalid vehicle number format (e.g., KA01AB1234)');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post('/vehicles', {
        ownerName,
        ownerMobile,
        vehicleNumber,
        vehicleType
      });

      Alert.alert('Success', 'Vehicle registered successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) {
          Alert.alert('Duplicate', 'This vehicle is already registered');
        } else if (status === 400) {
          const errors = data.data;
          const errorMessage = Object.values(errors).join('\n');
          Alert.alert('Validation Error', errorMessage);
        } else {
          Alert.alert('Error', data.message || 'Registration failed');
        }
      } else {
        Alert.alert('Network Error', 'Please check your internet connection');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Owner Name"
        value={ownerName}
        onChangeText={setOwnerName}
      />

      <TextInput
        placeholder="Owner Mobile (10 digits)"
        value={ownerMobile}
        onChangeText={setOwnerMobile}
        keyboardType="number-pad"
        maxLength={10}
      />

      <TextInput
        placeholder="Vehicle Number (e.g., KA01AB1234)"
        value={vehicleNumber}
        onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
        autoCapitalize="characters"
        maxLength={12}
      />

      <Picker
        selectedValue={vehicleType}
        onValueChange={setVehicleType}
      >
        <Picker.Item label="Car" value="CAR" />
        <Picker.Item label="Bike" value="BIKE" />
      </Picker>

      <Button
        title={loading ? 'Registering...' : 'Register Vehicle'}
        onPress={handleRegister}
        disabled={loading}
      />
    </View>
  );
};

export default VehicleRegistrationScreen;
```

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9133733197","pin":"777777"}'

# Get all vehicles (replace TOKEN with actual token)
curl -X GET http://localhost:8080/api/vehicles \
  -H "Authorization: Bearer TOKEN"

# Mark arrival
curl -X POST http://localhost:8080/api/attendance/mark-arrival \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicleNumber":"KA01AB1234"}'
```

### Using Postman

1. **Create Environment Variables:**
   - `baseUrl`: `http://localhost:8080/api`
   - `accessToken`: (set after login)

2. **Login Request:**
   - Method: POST
   - URL: `{{baseUrl}}/auth/login`
   - Body (JSON):
     ```json
     {
       "mobileNumber": "9133733197",
       "pin": "777777"
     }
     ```
   - In Tests tab, add:
     ```javascript
     pm.environment.set("accessToken", pm.response.json().data.accessToken);
     ```

3. **Protected Requests:**
   - Authorization tab: Bearer Token
   - Token: `{{accessToken}}`

---

## Summary Checklist for Frontend

- [ ] Setup axios/fetch with base URL and timeout
- [ ] Implement token storage with expo-secure-store
- [ ] Create API interceptors for token refresh
- [ ] Build login screen with validation
- [ ] Implement tick/attendance screen with unmarked list
- [ ] Create vehicle registration form
- [ ] Add vehicle search with debouncing
- [ ] Build reports screen with date picker
- [ ] Handle all error scenarios gracefully
- [ ] Add loading states and refresh controls
- [ ] Test offline scenarios
- [ ] Implement role-based UI (hide admin features for STAFF)

---

**Need Help?** Refer to the main README.md for setup instructions and server configuration.

**Happy Coding! 🚀**
