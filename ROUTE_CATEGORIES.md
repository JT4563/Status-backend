# CrowdShield AI - Route Categories & Usage

## 📋 Route Classification

This document categorizes all API routes by their intended consumers and usage patterns.

---

## 🌐 **FRONTEND ROUTES** (React Dashboard Consumption)

These routes are called directly by the React frontend dashboard to display data and handle user interactions.

### 🔐 Authentication Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/auth/login` | POST | User login, get JWT token | ❌ No |

**Frontend Usage:**
- Login page calls this to authenticate users
- Returns JWT token for subsequent API calls

---

### 🗺️ Map & Location Data Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/map-data` | GET | Get location points and density data for map | ❌ No |

**Frontend Usage:**
- Map component calls this to populate heatmap
- Query params: `eventId`, `bbox`, `windowSec`
- Returns: `{points: [...], density: [...], updatedAt: "..."}`

---

### 🚨 Alert Management Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/alerts` | GET | Get list of alerts for event | ✅ Yes |
| `/api/v1/alerts/:id/resolve` | PATCH | Mark alert as resolved | ✅ Yes |

**Frontend Usage:**
- Alerts panel displays current alerts
- Operators can resolve alerts via UI buttons
- Real-time updates via WebSocket events

---

### 🤖 AI Insights Routes (Frontend Facing)
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/ai-insights` | GET | Get current AI risk assessment | ✅ Yes |
| `/api/v1/ai-predictions` | GET | Get AI predictions for zones | ✅ Yes |

**Frontend Usage:**
- AI insights widget displays risk scores and recommendations
- Map overlays use predictions for zone color coding
- **Note:** These routes call the ML service internally but are consumed by frontend

---

### ⚡ Action Management Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/actions` | POST | Record operator actions | ✅ Yes |

**Frontend Usage:**
- Action panel sends operator commands (open gates, dispatch help)
- Actions are logged and broadcast to all connected clients

---

### 📋 Report Management Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/reports` | POST | Submit incident reports | ❌ No (anonymous allowed) |
| `/api/v1/reports` | GET | Get reports for event | ❌ No |

**Frontend Usage:**
- Report submission forms (can be anonymous)
- Staff dashboard displays incoming reports
- Uses `Idempotency-Key` header to prevent duplicates

---

### 🏥 System Health Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/system-health` | GET | Check system status | ❌ No |

**Frontend Usage:**
- Admin panel shows system health status
- Monitors API, database, ML service, and WebSocket health

---

## 📱 **DEVICE/PHONE ROUTES** (Data Ingestion)

These routes are called by mobile devices, cameras, or IoT sensors to send data to the backend.

### 📍 Location Tracking Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/pings` | POST | Submit device location ping | ✅ Yes |

**Device Usage:**
- Mobile phones send GPS coordinates
- Creates heatmap data for real-time visualization
- TTL: Auto-expires after 15 minutes

**Example Payload:**
```json
{
  "eventId": "689eef4e6ce7f476939b7f8c",
  "lat": 40.7128,
  "lng": -74.0060,
  "ts": "2025-08-15T08:00:00Z"
}
```

---

### 📹 Camera/CCTV Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/v1/cctv/objects` | POST | Submit object detection results | ✅ Yes |

**Device Usage:**
- Phone cameras running detection web apps
- CCTV systems with object detection
- Sends people counts and bounding boxes

**Example Payload:**
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
    }
  ]
}
```

---

## 🤖 **ML SERVICE INTEGRATION** (Backend-to-ML Communication)

These are **NOT direct routes** but internal service calls from the backend to the ML microservice.

### ML Service Endpoints (Called by Backend)
| ML Endpoint | Method | Called From | Purpose |
|-------------|--------|-------------|---------|
| `${ML_BASE}/insights` | POST | `/api/v1/ai-insights` route | Get risk assessment |
| `${ML_BASE}/predictions` | POST | `/api/v1/ai-predictions` route | Get zone predictions |
| `${ML_BASE}/health` | GET | Health check service | Check ML service status |

### Backend ↔ ML Flow:
1. **Frontend** calls `/api/v1/ai-insights`
2. **Backend** calls `${ML_BASE}/insights` with features
3. **ML Service** returns risk score and recommendations
4. **Backend** caches result and returns to frontend
5. **Backend** broadcasts via WebSocket to all connected clients

**ML Service Configuration:**
```env
# .env
ML_BASE=http://localhost:5001
```

**ML Request Example:**
```json
// Backend → ML Service
POST ${ML_BASE}/insights
{
  "eventId": "689eef4e6ce7f476939b7f8c",
  "recentPings": [...],
  "zoneStats": [
    {"zoneId": "Z1", "density": 10, "flow": 0.2}
  ]
}
```

**ML Response Example:**
```json
// ML Service → Backend
{
  "riskScore": 0.78,
  "recommendation": "Open Gate 3; redirect flow",
  "confidence": 0.82,
  "factors": [
    {"name": "crowd_density", "weight": 0.6, "value": 0.85}
  ],
  "generatedAt": "2025-08-15T08:00:00Z"
}
```

---

## 📡 **WEBSOCKET EVENTS** (Real-time Communication)

WebSocket namespace: `/realtime?eventId=EVENT_ID`

### Events Emitted by Backend:
| Event | Triggered By | Payload | Frontend Usage |
|-------|--------------|---------|----------------|
| `map:update` | New pings received | `{points: [...], density: [...]}` | Update heatmap |
| `alert:new` | Alert created | `{id, type, message, severity, zoneId}` | Show new alert |
| `alert:updated` | Alert resolved | `{id, status, resolvedAt}` | Update alert status |
| `report:new` | Report submitted | `{id, type, message, location}` | Show new report |
| `action:created` | Action taken | `{id, command, zoneId, createdBy}` | Log action |
| `insight:update` | AI insights updated | `{riskScore, recommendation, confidence}` | Update AI widget |
| `prediction:update` | AI predictions updated | `{horizonMinutes, predictions: [...]}` | Update map zones |

---

## 🔄 **DATA FLOW SUMMARY**

### Frontend Dashboard Flow:
```
Frontend → Backend API → Database
                     ↓
Frontend ← WebSocket ← Background Processing
```

### Device Data Flow:
```
Mobile Device → Backend API → Database
                           ↓
Frontend ← WebSocket ← Alert Processing
```

### AI Integration Flow:
```
Frontend → Backend API → ML Service
                     ↓        ↓
Database ← Response ← Backend ← ML Response
                     ↓
Frontend ← WebSocket ← Cache & Broadcast
```

---

## 🎯 **Route Usage by Team**

### **Frontend Team** should use:
- ✅ `/api/v1/auth/*` - Authentication
- ✅ `/api/v1/users/*` - User management (Admin only)
- ✅ `/api/v1/map-data` - Map visualization
- ✅ `/api/v1/alerts/*` - Alert management
- ✅ `/api/v1/ai-insights` - AI dashboard widget
- ✅ `/api/v1/ai-predictions` - Map zone colors
- ✅ `/api/v1/actions` - Operator controls
- ✅ `/api/v1/reports/*` - Report management
- ✅ `/api/v1/system-health` - Status monitoring
- ✅ WebSocket `/realtime` - Real-time updates

### **Mobile/Device Team** should use:
- ✅ `/api/v1/pings` - Location tracking
- ✅ `/api/v1/cctv/objects` - Camera detections
- ✅ `/api/v1/auth/login` - Device authentication
- ✅ `/api/v1/reports` - Anonymous incident reporting

### **ML Team** should implement:
- ✅ `POST /insights` endpoint in their service
- ✅ `POST /predictions` endpoint in their service
- ✅ `GET /health` endpoint in their service
- ❌ **NOT** direct API routes (backend handles the integration)

---

## 🔒 **Authentication Summary**

### No Auth Required (Public):
- Health checks
- Map data (read-only)
- Report submission (anonymous)
- Report listing (read-only)

### Auth Required (JWT):
- All device data ingestion (pings, CCTV)
- Alert management
- AI insights/predictions
- Action creation
- User-specific operations

### Authentication Flow:
1. Get JWT from `/api/v1/auth/login`
2. Include in header: `Authorization: Bearer <token>`
3. Tokens expire in 15 minutes (configurable)
4. Re-login when token expires

This categorization helps each team understand exactly which routes they need to integrate with and how the data flows through the system!
