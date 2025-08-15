# Frontend → Backend Data Integration Guide

## 📋 Overview
This document specifies what data the frontend sends to the backend, through which endpoints, and in what format. This covers both the web dashboard and camera functionality integrated in the frontend.

---

## 🔐 **1. USER AUTHENTICATION**

### Login
**Purpose**: Authenticate users and get access token  
**Endpoint**: `POST /api/v1/auth/login`  
**When**: User submits login form

**Data Format**:
```json
{
  "email": "admin@crowdshield.ai",
  "password": "password123"
}
```

**Fields**:
- `email`: Valid email address (required)
- `password`: User password (required, min 6 characters)

---

## 🗺️ **2. MAP DATA REQUESTS**

### Get Location Points and Density
**Purpose**: Load map visualization data  
**Endpoint**: `GET /api/v1/map-data`  
**When**: Map loads, user changes view, time filter changes

**Query Parameters**:
- `eventId`: Event identifier (optional)
- `bbox`: Map bounds as "minLng,minLat,maxLng,maxLat" (optional)
- `windowSec`: Time window in seconds, default 300 (optional)

**Example**: `/api/v1/map-data?eventId=EVENT123&bbox=77.5,12.9,77.7,13.1&windowSec=600`

---

## 🚨 **3. ALERT MANAGEMENT**

### Get Alerts List
**Purpose**: Display current alerts in dashboard  
**Endpoint**: `GET /api/v1/alerts`  
**When**: Alerts panel loads, user filters alerts

**Query Parameters**:
- `eventId`: Event identifier (required)
- `status`: Filter by "active" or "resolved" (optional)

### Resolve Alert
**Purpose**: Mark alert as resolved  
**Endpoint**: `PATCH /api/v1/alerts/:alertId/resolve`  
**When**: Operator clicks resolve button

**No data required** - just the alert ID in URL

---

## 🤖 **4. AI INSIGHTS & PREDICTIONS**

### Get AI Risk Assessment
**Purpose**: Display current risk level and recommendations  
**Endpoint**: `GET /api/v1/ai-insights`  
**When**: AI widget loads, periodic refresh (30 seconds)

**Query Parameters**:
- `eventId`: Event identifier (required)

### Get AI Zone Predictions
**Purpose**: Show predicted risk for map zones  
**Endpoint**: `GET /api/v1/ai-predictions`  
**When**: Map loads, user changes prediction horizon

**Query Parameters**:
- `eventId`: Event identifier (required)
- `horizonMinutes`: Prediction time horizon, default 5 (optional)

---

## 📹 **5. CAMERA DATA SUBMISSION**

### Submit Object Detections
**Purpose**: Send people detection results from frontend camera  
**Endpoint**: `POST /api/v1/cctv/objects`  
**When**: Camera detects people/objects

**Data Format**:
```json
{
  "eventId": "EVENT123",
  "cameraId": "frontend-cam-1",
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

**Fields**:
- `eventId`: Current event (required)
- `cameraId`: Camera identifier from frontend (required)
- `ts`: Timestamp in ISO format (required)
- `objects`: Array of detected objects (required)
  - `label`: Object type, usually "person" (required)
  - `bbox`: Bounding box [x, y, width, height] (required)
  - `confidence`: Detection confidence 0-1 (required)

### Submit Location Pings
**Purpose**: Send device GPS location for heatmap  
**Endpoint**: `POST /api/v1/pings`  
**When**: Periodic location updates from frontend

**Data Format**:
```json
{
  "eventId": "EVENT123",
  "lat": 40.7128,
  "lng": -74.0060,
  "ts": "2025-08-15T08:00:00Z"
}
```

**Fields**:
- `eventId`: Current event (required)
- `lat`: Latitude coordinate (required)
- `lng`: Longitude coordinate (required)
- `ts`: Timestamp in ISO format (optional, auto-generated if not provided)

---

## ⚡ **6. OPERATOR ACTIONS**

### Submit Action Command
**Purpose**: Record operator decisions and commands  
**Endpoint**: `POST /api/v1/actions`  
**When**: Operator clicks action buttons or submits custom action

**Data Format**:
```json
{
  "eventId": "EVENT123",
  "zoneId": "zone-entrance-a",
  "command": "Open Gate 3",
  "notes": "Redirecting crowd flow due to high density"
}
```

**Fields**:
- `eventId`: Current event (required)
- `command`: Action description (required)
- `zoneId`: Specific zone if applicable (optional)
- `notes`: Additional details (optional)

**Common Actions**:
- "Open Gate 3"
- "Dispatch Security Team"
- "Send PA Announcement"
- "Close Entrance"
- "Redirect Traffic Flow"

---

## 📋 **7. INCIDENT REPORTS**

### Submit Report
**Purpose**: Report incidents, hazards, or issues  
**Endpoint**: `POST /api/v1/reports`  
**When**: User submits incident report form

**Data Format**:
```json
{
  "eventId": "EVENT123",
  "type": "hazard",
  "message": "Emergency exit blocked by equipment",
  "zoneId": "zone-emergency-exit",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

**Fields**:
- `eventId`: Current event (required)
- `type`: Report category (required)
  - Options: "incident", "hazard", "medical", "security", "other"
- `message`: Description of issue (required)
- `zoneId`: Specific zone (optional)
- `location`: GPS coordinates (optional)
  - `lat`: Latitude
  - `lng`: Longitude

### Get Reports List
**Purpose**: Display submitted reports  
**Endpoint**: `GET /api/v1/reports`  
**When**: Reports panel loads

**Query Parameters**:
- `eventId`: Event identifier (required)

---

## 🏥 **8. SYSTEM HEALTH**

### Check System Status
**Purpose**: Monitor system health  
**Endpoint**: `GET /api/v1/system-health`  
**When**: Admin panel loads, periodic health checks

**No parameters required**

---

## 📡 **9. REAL-TIME EVENTS**

### WebSocket Connection
**Purpose**: Receive live updates  
**Namespace**: `/realtime`  
**When**: User enters dashboard

**Connection Parameters**:
- `eventId`: Current event in query
- `token`: JWT token in auth header

**Events Received**:
- `map:update`: New location data
- `alert:new`: New alert created
- `alert:updated`: Alert status changed
- `insight:update`: New AI insights
- `prediction:update`: New AI predictions
- `action:created`: New operator action
- `report:new`: New report submitted

---

## 🎯 **Data Flow Summary**

### **Dashboard Functions**:
1. **Login** → Get JWT token
2. **Load Map** → Get location points and density
3. **View Alerts** → Get alert list, resolve alerts
4. **AI Insights** → Get risk scores and predictions
5. **Take Actions** → Submit operator commands
6. **Manage Reports** → Submit and view incident reports
7. **Monitor Health** → Check system status

### **Camera Functions** (Integrated in Frontend):
1. **Object Detection** → Send detected people counts
2. **Location Tracking** → Send GPS coordinates for heatmap

### **Real-time Updates**:
- All data changes broadcast via WebSocket
- Frontend receives live updates without refreshing

### **Authentication**:
- Most endpoints require JWT token in Authorization header
- Reports can be submitted anonymously
- Camera data requires authentication

This simplified format focuses on **what data to send**, **which endpoint to use**, and **when to send it**, without complex implementation details.

---

## ⚡ **5. OPERATOR ACTIONS**

### Submit Operator Action
**When**: Operator clicks action buttons or submits custom action  
**Endpoint**: `POST /api/v1/actions`  
**Frontend Trigger**: Button clicks, form submission

**Request Body from Frontend:**
```typescript
interface ActionRequest {
  eventId: string;            // Required: current event
  zoneId?: string;            // Optional: specific zone
  command: string;            // Required: action command
  notes?: string;             // Optional: additional notes
}
```

**Frontend Implementation:**
```typescript
// Predefined action buttons
const quickActions = [
  { label: 'Open Gate 3', command: 'Open Gate 3', zoneId: 'zone-3' },
  { label: 'Dispatch Security', command: 'Dispatch Security Team' },
  { label: 'Send Evacuation Alert', command: 'Send Evacuation Alert' }
];

// Frontend action submitter
const submitAction = async (actionData: ActionRequest) => {
  const response = await fetch('/api/v1/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      eventId: currentEventId,
      ...actionData
    })
  });
  
  if (response.ok) {
    showSuccessMessage('Action executed successfully');
  }
};

// Quick action handler
const handleQuickAction = (action: typeof quickActions[0]) => {
  submitAction({
    eventId: currentEventId,
    command: action.command,
    zoneId: action.zoneId,
    notes: `Quick action: ${action.label}`
  });
};

// Custom action form handler
const handleCustomAction = (formData: { command: string; notes: string; zoneId?: string }) => {
  submitAction({
    eventId: currentEventId,
    command: formData.command,
    notes: formData.notes,
    zoneId: formData.zoneId
  });
};
```

**Example Action Scenarios:**
```typescript
// Gate control action
submitAction({
  eventId: "689eef4e6ce7f476939b7f8c",
  zoneId: "zone-entrance-a",
  command: "Open Gate 3",
  notes: "Redirecting crowd flow due to high density"
});

// Security dispatch action
submitAction({
  eventId: "689eef4e6ce7f476939b7f8c",
  command: "Dispatch Security Team",
  notes: "Response to overcrowding alert in Zone B"
});

// General announcement action
submitAction({
  eventId: "689eef4e6ce7f476939b7f8c",
  command: "Send PA Announcement",
  notes: "Please use alternative exits - temporary closure of Gate 2"
});
```

---

## 📋 **6. INCIDENT REPORTS**

### Submit New Report
**When**: User fills out incident report form  
**Endpoint**: `POST /api/v1/reports`  
**Frontend Trigger**: Form submission (can be anonymous)

**Request Body from Frontend:**
```typescript
interface ReportRequest {
  eventId: string;            // Required: current event
  zoneId?: string;            // Optional: specific zone
  type: 'incident' | 'hazard' | 'medical' | 'security' | 'other';
  message: string;            // Required: description
  location?: {                // Optional: specific coordinates
    lat: number;
    lng: number;
  };
  attachments?: string[];     // Optional: file URLs/IDs
}
```

**Frontend Implementation:**
```typescript
// Frontend report form
const submitReport = async (reportData: ReportRequest) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Add auth header if user is logged in
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Add idempotency key for duplicate prevention
  const idempotencyKey = `report-${Date.now()}-${Math.random()}`;
  headers['Idempotency-Key'] = idempotencyKey;
  
  const response = await fetch('/api/v1/reports', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      eventId: currentEventId,
      ...reportData
    })
  });
  
  if (response.ok) {
    showSuccessMessage('Report submitted successfully');
    resetForm();
  }
};

// Report form handler
const handleReportSubmit = (formData: {
  type: string;
  message: string;
  zoneId?: string;
  location?: { lat: number; lng: number };
}) => {
  submitReport({
    eventId: currentEventId,
    type: formData.type as ReportRequest['type'],
    message: formData.message,
    zoneId: formData.zoneId,
    location: formData.location
  });
};
```

**Example Report Submissions:**
```typescript
// Hazard report
submitReport({
  eventId: "689eef4e6ce7f476939b7f8c",
  zoneId: "zone-emergency-exit",
  type: "hazard",
  message: "Emergency exit blocked by equipment",
  location: { lat: 40.7128, lng: -74.0060 }
});

// Medical incident report
submitReport({
  eventId: "689eef4e6ce7f476939b7f8c",
  type: "medical",
  message: "Person collapsed near main stage",
  location: { lat: 40.7130, lng: -74.0058 }
});

// Anonymous security report
submitReport({
  eventId: "689eef4e6ce7f476939b7f8c",
  type: "security",
  message: "Suspicious behavior observed near entrance"
});
```

### Get Reports for Display
**When**: Reports panel loads or user refreshes  
**Endpoint**: `GET /api/v1/reports`  
**Frontend Trigger**: Component mount, refresh button

**Query Parameters from Frontend:**
```typescript
interface ReportsParams {
  eventId: string;            // Required: current event
  type?: string;              // Optional: filter by report type
  limit?: number;             // Optional: number of reports to fetch
}
```

---

## 🏥 **7. SYSTEM HEALTH MONITORING**

### Check System Status
**When**: Admin panel loads or periodic health checks  
**Endpoint**: `GET /api/v1/system-health`  
**Frontend Trigger**: Admin component mount, periodic polling

**Frontend Implementation:**
```typescript
// Frontend health checker
const checkSystemHealth = async () => {
  const response = await fetch('/api/v1/system-health');
  const healthData = await response.json();
  
  // Update health indicators in UI
  updateHealthIndicators(healthData);
  
  return healthData;
};

// Periodic health check every 30 seconds
useEffect(() => {
  const interval = setInterval(checkSystemHealth, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 📡 **8. WEBSOCKET CONNECTION**

### Establish Real-time Connection
**When**: User logs in and enters dashboard  
**Frontend Trigger**: Dashboard component mount

**Connection Setup:**
```typescript
// Frontend WebSocket connection
const connectWebSocket = (eventId: string, authToken: string) => {
  const socket = io('/realtime', {
    auth: { token: authToken },
    query: { eventId }
  });
  
  // Connection event handlers
  socket.on('connect', () => {
    setConnectionStatus('connected');
  });
  
  socket.on('disconnect', () => {
    setConnectionStatus('disconnected');
  });
  
  // Data event handlers
  socket.on('map:update', (mapData) => {
    updateMapDisplay(mapData);
  });
  
  socket.on('alert:new', (alert) => {
    addNewAlert(alert);
    showNotification(`New ${alert.severity} alert: ${alert.message}`);
  });
  
  socket.on('alert:updated', (alertUpdate) => {
    updateAlertStatus(alertUpdate);
  });
  
  socket.on('insight:update', (insights) => {
    updateAIWidget(insights);
  });
  
  socket.on('prediction:update', (predictions) => {
    updateMapZoneColors(predictions);
  });
  
  socket.on('action:created', (action) => {
    addActionToHistory(action);
    showNotification(`Action executed: ${action.command}`);
  });
  
  socket.on('report:new', (report) => {
    addNewReport(report);
    showNotification('New incident report received');
  });
  
  return socket;
};
```

---

## 🔄 **9. FRONTEND STATE MANAGEMENT**

### React Context for API Data
```typescript
// Frontend context for managing API state
interface AppContextType {
  currentEventId: string;
  alerts: Alert[];
  mapData: MapData | null;
  aiInsights: AIInsights | null;
  predictions: AIPrediction[];
  reports: Report[];
  actions: Action[];
  systemHealth: SystemHealth | null;
}

// Actions that trigger API calls
const AppActions = {
  // Load initial data
  LOAD_DASHBOARD: 'LOAD_DASHBOARD',
  
  // Real-time updates
  UPDATE_MAP_DATA: 'UPDATE_MAP_DATA',
  ADD_ALERT: 'ADD_ALERT',
  UPDATE_ALERT: 'UPDATE_ALERT',
  UPDATE_AI_INSIGHTS: 'UPDATE_AI_INSIGHTS',
  UPDATE_PREDICTIONS: 'UPDATE_PREDICTIONS',
  ADD_REPORT: 'ADD_REPORT',
  ADD_ACTION: 'ADD_ACTION',
  
  // User actions
  RESOLVE_ALERT: 'RESOLVE_ALERT',
  SUBMIT_ACTION: 'SUBMIT_ACTION',
  SUBMIT_REPORT: 'SUBMIT_REPORT'
};
```

---

## 🎯 **10. FRONTEND VALIDATION RULES**

### Client-Side Validation Before API Calls
```typescript
// Validation schemas for frontend forms
const validationRules = {
  login: {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  },
  
  action: {
    command: { required: true, minLength: 3, maxLength: 200 },
    notes: { maxLength: 500 },
    eventId: { required: true }
  },
  
  report: {
    type: { required: true, oneOf: ['incident', 'hazard', 'medical', 'security', 'other'] },
    message: { required: true, minLength: 10, maxLength: 1000 },
    eventId: { required: true }
  }
};

// Frontend validation helper
const validateForm = (data: any, rules: any) => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && !value) {
      errors[field] = `${field} is required`;
    }
    
    if (rule.email && value && !isValidEmail(value)) {
      errors[field] = 'Invalid email format';
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Minimum ${rule.minLength} characters required`;
    }
  });
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
```

---

## 📊 **11. ERROR HANDLING PATTERNS**

### Frontend Error Handling for API Calls
```typescript
// Centralized error handler
const handleApiError = (error: any, context: string) => {
  if (error.status === 401) {
    // Token expired - redirect to login
    logout();
    showErrorMessage('Session expired. Please log in again.');
    return;
  }
  
  if (error.status === 403) {
    showErrorMessage('You do not have permission to perform this action.');
    return;
  }
  
  if (error.status === 400) {
    showErrorMessage(error.message || 'Invalid request data.');
    return;
  }
  
  if (error.status >= 500) {
    showErrorMessage('Server error. Please try again later.');
    return;
  }
  
  showErrorMessage(`Error in ${context}: ${error.message}`);
};

// API call wrapper with error handling
const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { status: response.status, message: errorData.message || response.statusText };
    }
    
    return response.json();
  } catch (error) {
    handleApiError(error, url);
    throw error;
  }
};
```

---

## 🔑 **Summary: Frontend → Backend Data Flow**

This document provides the complete specification for frontend developers to understand:

1. **What data to send** - Exact JSON structures and field types
2. **Which endpoints to use** - Complete API routes with methods
3. **When to send data** - UI triggers and user interactions
4. **How to handle responses** - Success/error scenarios
5. **Real-time integration** - WebSocket event handling
6. **Validation rules** - Client-side validation before API calls
7. **Error handling** - Proper error response handling

**Key takeaway**: Frontend sends structured data through well-defined API endpoints, receives responses, and handles real-time updates via WebSocket events. All authentication uses JWT tokens, and the backend handles the complexity of ML integration internally.
