# CrowdShield AI - API Documentation

## Overview
This document describes all API endpoints, their purpose, required data formats, and responses. The backend runs on `http://localhost:8080` and all API endpoints are prefixed with `/api/v1/`.

## Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

Get a JWT token by logging in first using the `/auth/login` endpoint.

---

## 📚 Endpoint Reference

### 🔐 Authentication Endpoints

#### 1. Login
**Purpose**: Authenticate a user and get a JWT token for subsequent requests.

- **Endpoint**: `POST /api/v1/auth/login`
- **Authentication**: None required
- **Request Body**:
```json
{
  "email": "admin@crowdshield.ai",
  "password": "password123"
}
```
- **Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "689eef4e6ce7f476939b7f89",
    "name": "Admin",
    "role": "admin"
  }
}
```
- **Use Case**: Frontend login page sends user credentials and receives JWT token to store for subsequent API calls.

---

### 🗺️ Map & Location Endpoints

#### 2. Get Map Data
**Purpose**: Retrieve location points and density data for displaying on the map.

- **Endpoint**: `GET /api/v1/map-data`
- **Authentication**: None required
- **Query Parameters**:
  - `eventId` (optional): Filter by specific event
  - `bbox` (optional): Bounding box as `minLng,minLat,maxLng,maxLat`
  - `windowSec` (optional): Time window in seconds (default: 300)
- **Example Request**:
```
GET /api/v1/map-data?eventId=689eef4e6ce7f476939b7f8c&bbox=40.7,-74.1,40.8,-74.0&windowSec=300
```
- **Response**:
```json
{
  "points": [
    {
      "lat": 40.7128,
      "lng": -74.0060,
      "ts": "2025-08-15T08:00:00Z"
    }
  ],
  "density": [
    {
      "cell": [40.7128, -74.0060],
      "count": 15
    }
  ],
  "updatedAt": "2025-08-15T08:00:00Z"
}
```
- **Use Case**: Frontend map component calls this to get location points and density data for heatmap visualization.

#### 3. Send Location Ping
**Purpose**: Submit device location for tracking on the map.

- **Endpoint**: `POST /api/v1/pings`
- **Authentication**: Required (JWT)
- **Request Body**:
```json
{
  "eventId": "689eef4e6ce7f476939b7f8c",
  "lat": 40.7128,
  "lng": -74.0060,
  "ts": "2025-08-15T08:00:00Z"
}
```
- **Response**:
```json
{
  "id": "689eef4e6ce7f476939b7f90"
}
```
- **Use Case**: Mobile devices or phone cameras send their GPS location periodically to create a live heatmap.

---

### 📹 CCTV & Object Detection Endpoints

#### 4. Submit Object Detections
**Purpose**: Send object detection results from cameras (including phone cameras).

- **Endpoint**: `POST /api/v1/cctv/objects`
- **Authentication**: Required (JWT)
- **Request Body**:
```json
{
  "eventId": "689eef4e6ce7f476939b7f8c",
  "cameraId": "phone-01",
  "ts": "2025-08-15T08:00:05Z",
  "objects": [
    {
      "label": "person",
      "bbox": [100, 200, 150, 250],
      "confidence": 0.92
    },
    {
      "label": "person",
      "bbox": [300, 150, 350, 280],
      "confidence": 0.88
    }
  ]
}
```
- **Response**:
```json
{
  "ok": true
}
```
- **Use Case**: Phone camera web apps or CCTV systems send detected objects (people counts, bounding boxes) to trigger alerts.

---

### 🚨 Alert Management Endpoints

#### 5. Get Alerts
**Purpose**: Retrieve current alerts for an event.

- **Endpoint**: `GET /api/v1/alerts`
- **Authentication**: Required (JWT)
- **Query Parameters**:
  - `eventId` (required): Event ID to filter alerts
  - `status` (optional): Filter by status (`active`, `resolved`)
- **Example Request**:
```
GET /api/v1/alerts?eventId=689eef4e6ce7f476939b7f8c&status=active
```
- **Response**:
```json
{
  "items": [
    {
      "id": "689eef4e6ce7f476939b7f91",
      "eventId": "689eef4e6ce7f476939b7f8c",
      "type": "overcrowd",
      "message": "High density detected in Zone A",
      "severity": "high",
      "status": "active",
      "zoneId": "689eef4e6ce7f476939b7f8e",
      "createdAt": "2025-08-15T08:00:00Z"
    }
  ]
}
```
- **Use Case**: Frontend alerts panel displays current active alerts to operators.

#### 6. Resolve Alert
**Purpose**: Mark an alert as resolved.

- **Endpoint**: `PATCH /api/v1/alerts/:alertId/resolve`
- **Authentication**: Required (JWT)
- **Request Body**: None
- **Response**:
```json
{
  "ok": true
}
```
- **Use Case**: Operators click "Resolve" button on alerts in the frontend.

---

### 🤖 AI & Machine Learning Endpoints

#### 7. Get AI Insights
**Purpose**: Get current risk assessment and AI recommendations.

- **Endpoint**: `GET /api/v1/ai-insights`
- **Authentication**: Required (JWT)
- **Query Parameters**:
  - `eventId` (required): Event ID for analysis
- **Example Request**:
```
GET /api/v1/ai-insights?eventId=689eef4e6ce7f476939b7f8c
```
- **Response**:
```json
{
  "riskScore": 0.78,
  "recommendation": "Open Gate 3; redirect flow to Zone B",
  "confidence": 0.82,
  "factors": [
    {
      "name": "crowd_density",
      "weight": 0.6,
      "value": 0.85
    },
    {
      "name": "movement_flow",
      "weight": 0.4,
      "value": 0.65
    }
  ],
  "mlStatus": "ok",
  "generatedAt": "2025-08-15T08:00:00Z"
}
```
- **Use Case**: Frontend AI dashboard widget shows risk level and recommended actions to operators.

#### 8. Get AI Predictions
**Purpose**: Get short-term predictions for different zones.

- **Endpoint**: `GET /api/v1/ai-predictions`
- **Authentication**: Required (JWT)
- **Query Parameters**:
  - `eventId` (required): Event ID for predictions
  - `horizonMinutes` (optional): Prediction horizon in minutes (default: 5)
- **Example Request**:
```
GET /api/v1/ai-predictions?eventId=689eef4e6ce7f476939b7f8c&horizonMinutes=10
```
- **Response**:
```json
{
  "horizonMinutes": 10,
  "predictions": [
    {
      "zoneId": "689eef4e6ce7f476939b7f8e",
      "risk": 0.65,
      "confidence": 0.75,
      "predictedDensity": 25
    },
    {
      "zoneId": "689eef4e6ce7f476939b7f8f",
      "risk": 0.30,
      "confidence": 0.80,
      "predictedDensity": 12
    }
  ],
  "mlStatus": "ok",
  "generatedAt": "2025-08-15T08:00:00Z"
}
```
- **Use Case**: Frontend map overlays zones with predicted risk colors for proactive management.

---

### ⚡ Action Management Endpoints

#### 9. Create Action
**Purpose**: Record operator actions and optionally trigger notifications.

- **Endpoint**: `POST /api/v1/actions`
- **Authentication**: Required (JWT)
- **Request Body**:
```json
{
  "eventId": "689eef4e6ce7f476939b7f8c",
  "zoneId": "689eef4e6ce7f476939b7f8e",
  "command": "Open Gate 3",
  "notes": "Redirecting crowd flow to reduce density"
}
```
- **Response**:
```json
{
  "id": "689eef4e6ce7f476939b7f92",
  "eventId": "689eef4e6ce7f476939b7f8c",
  "zoneId": "689eef4e6ce7f476939b7f8e",
  "command": "Open Gate 3",
  "notes": "Redirecting crowd flow to reduce density",
  "createdBy": "689eef4e6ce7f476939b7f89",
  "createdAt": "2025-08-15T08:00:00Z",
  "status": "executed"
}
```
- **Use Case**: Operators take actions (open gates, dispatch security) and these are logged and broadcast to all connected clients.

---

### 📋 Report Management Endpoints

#### 10. Create Report
**Purpose**: Submit incident reports (can be anonymous or from staff).

- **Endpoint**: `POST /api/v1/reports`
- **Authentication**: None required (anonymous reports allowed)
- **Headers** (optional):
  - `Idempotency-Key`: Prevents duplicate submissions
- **Request Body**:
```json
{
  "eventId": "689eef4e6ce7f476939b7f8c",
  "zoneId": "689eef4e6ce7f476939b7f8e",
  "type": "hazard",
  "message": "Blocked emergency exit in Zone A",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```
- **Response**:
```json
{
  "id": "689eef4e6ce7f476939b7f93",
  "status": "received"
}
```
- **Use Case**: Attendees or staff report incidents through mobile apps or web forms.

#### 11. Get Reports
**Purpose**: Retrieve reports for an event.

- **Endpoint**: `GET /api/v1/reports`
- **Authentication**: None required
- **Query Parameters**:
  - `eventId` (required): Event ID to filter reports
- **Example Request**:
```
GET /api/v1/reports?eventId=689eef4e6ce7f476939b7f8c
```
- **Response**:
```json
{
  "items": [
    {
      "id": "689eef4e6ce7f476939b7f93",
      "eventId": "689eef4e6ce7f476939b7f8c",
      "type": "hazard",
      "message": "Blocked emergency exit in Zone A",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "createdAt": "2025-08-15T08:00:00Z"
    }
  ]
}
```
- **Use Case**: Staff dashboard shows incoming reports for quick response.

---

### 🏥 System Health Endpoints

#### 12. System Health Check
**Purpose**: Check overall system status and component health.

- **Endpoint**: `GET /api/v1/system-health`
- **Authentication**: None required
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-08-15T08:00:00Z",
  "components": {
    "api": "ok",
    "database": "ok",
    "ml": "degraded",
    "socket": "ok"
  },
  "uptime": 3600,
  "version": "1.0.0"
}
```
- **Use Case**: Frontend admin panel shows system status; CI/CD monitoring.

---

## 📡 Real-Time WebSocket Events

The backend broadcasts real-time updates via Socket.IO to namespace `/realtime`.

### Connection
```javascript
// Frontend connection example
const socket = io('/realtime', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  query: {
    eventId: '689eef4e6ce7f476939b7f8c'
  }
});
```

### Events Emitted by Server

| Event | Payload | Description |
|-------|---------|-------------|
| `map:update` | `{points: [...], density: [...], updatedAt: "..."}` | New location data for map |
| `alert:new` | `{id, type, message, severity, zoneId, createdAt}` | New alert created |
| `alert:updated` | `{id, status, resolvedAt}` | Alert status changed |
| `report:new` | `{id, type, message, location, createdAt}` | New report submitted |
| `action:created` | `{id, command, zoneId, createdBy, createdAt}` | Operator action taken |
| `insight:update` | `{riskScore, recommendation, confidence, factors}` | New AI insights |
| `prediction:update` | `{horizonMinutes, predictions: [...]}` | New AI predictions |

---

## 🔧 Frontend Integration Guide

### 1. Authentication Flow
```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await loginResponse.json();

// Store token for subsequent requests
localStorage.setItem('authToken', token);
```

### 2. Making Authenticated Requests
```javascript
const authToken = localStorage.getItem('authToken');
const response = await fetch('/api/v1/alerts?eventId=EVENT_ID', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

### 3. Setting up WebSocket Connection
```javascript
const socket = io('/realtime', {
  auth: { token: authToken },
  query: { eventId: currentEventId }
});

socket.on('alert:new', (alert) => {
  // Update alerts UI
  updateAlertsPanel(alert);
});

socket.on('map:update', (mapData) => {
  // Update map with new points
  updateHeatmap(mapData.points, mapData.density);
});
```

### 4. Error Handling
```javascript
// Handle auth errors
if (response.status === 401) {
  // Token expired, redirect to login
  redirectToLogin();
}

// Handle validation errors
if (response.status === 400) {
  const error = await response.json();
  showValidationError(error.message);
}
```

---

## 📝 Common Data Formats

### Event ID Format
- MongoDB ObjectId: `689eef4e6ce7f476939b7f8c` (24 character hex string)

### Coordinates Format
- Latitude/Longitude: `{ lat: 40.7128, lng: -74.0060 }`
- Bounding Box: `minLng,minLat,maxLng,maxLat`

### Timestamp Format
- ISO 8601: `2025-08-15T08:00:00Z`

### Bounding Box Format
- `bbox` parameter: `[minLng, minLat, maxLng, maxLat]`
- Example: `40.7,-74.1,40.8,-74.0` (covers part of NYC)

---

## 🚀 Quick Start for Frontend Developers

1. **Get Authentication**: Call `/auth/login` with credentials
2. **Get Map Data**: Call `/map-data` to populate initial map
3. **Setup WebSocket**: Connect to `/realtime` for live updates
4. **Handle User Actions**: Submit actions via `/actions` endpoint
5. **Display Alerts**: Get alerts via `/alerts` and listen for `alert:new` events
6. **Show AI Insights**: Call `/ai-insights` and listen for `insight:update` events

This API is designed to support a real-time crowd monitoring dashboard with live updates, AI-powered insights, and operator action tracking.
