# WebSocket Implementation Guide - CrowdShield AI

## 🎯 **Complete WebSocket Roadmap for Frontend**

### **What is WebSocket and Why We Need It**
WebSocket is a communication protocol that enables real-time, two-way communication between the frontend dashboard and backend server. Unlike traditional HTTP requests where the frontend has to constantly ask "Is there new data?", WebSocket allows the backend to instantly push updates to the frontend the moment something happens.

**Think of it like this:**
- **HTTP (Traditional)**: Frontend keeps calling backend every few seconds asking "Any new alerts? Any new data?"
- **WebSocket (Real-time)**: Backend immediately tells frontend "Hey! New alert just happened!" or "New people detected!"

### **Why CrowdShield AI Needs Real-Time Updates**
In crowd management, **seconds matter**. When a dangerous crowd density is detected or an emergency happens:
- Operators need **instant notifications** - not 30 seconds later
- All operators should see the **same information simultaneously**
- Map visualizations should update **live** as people move
- AI recommendations should appear **immediately** when risk increases

### **How WebSocket Works in CrowdShield AI - Complete Flow**

#### **1. The Big Picture**
```
📱 Frontend Dashboard  ←→  🌐 WebSocket Connection  ←→  🖥️ Backend Server
    ↓                                                         ↓
📊 Live Updates                                         🔄 Real-time Events
📍 Map Changes                                          🚨 Alert Processing  
🤖 AI Insights                                          📊 Data Processing
⚡ Action Confirmations                                  💾 Database Updates
```

#### **2. Connection Establishment (When User Logs In)**
**Step 1**: User logs into dashboard with email/password
**Step 2**: Backend gives JWT token for authentication
**Step 3**: Frontend creates WebSocket connection using that token
**Step 4**: Backend verifies token and puts user in specific event room
**Step 5**: Connection established - ready for real-time updates!

```
Frontend: "Hey backend, I want to connect! Here's my token and event ID"
Backend: "Token verified! Welcome to event room 'EVENT123'. You're now live!"
```

#### **3. Real-Time Event Broadcasting (The Magic Happens)**

**When something happens in the system, here's the flow:**

##### **Camera Detects Overcrowding:**
```
📹 Frontend Camera → Counts 35 people
📤 Sends to Backend → POST /api/v1/cctv/objects
🔍 Backend Checks → "35 > 30 threshold = ALERT!"
💾 Saves Alert → Database stores new alert
📡 WebSocket Broadcast → "alert:new" to all connected dashboards
📱 All Frontends → Instantly show alert notification
🗺️ Map Updates → Highlights dangerous zone in red
```

##### **Someone Sends Location Ping:**
```
📍 Device Location → GPS coordinates received
📤 Sends to Backend → POST /api/v1/pings
💾 Stores Location → Database saves ping with 15min expiry
📡 WebSocket Broadcast → "map:update" with new point
🗺️ All Maps → Instantly show new dot on heatmap
📊 Density Updates → Live crowd visualization changes
```

##### **Operator Takes Action:**
```
👨‍💼 Operator → Clicks "Open Gate 3" button
📤 Sends to Backend → POST /api/v1/actions
💾 Logs Action → Database records the command
📡 WebSocket Broadcast → "action:created" to all operators
📱 All Dashboards → Show "Gate 3 Opened" confirmation
📝 Action History → Updates on all connected screens
```

##### **AI Generates New Risk Assessment:**
```
🤖 AI Analysis → Backend requests risk from ML service
📊 ML Response → "Risk: 78%, Recommendation: Open Gate 3"
💾 Caches Result → Backend stores AI insights
📡 WebSocket Broadcast → "insight:update" to all frontends
📱 AI Widget → Risk meter updates to 78% immediately
💡 Recommendation → "Open Gate 3" appears on all screens
```

#### **4. Frontend Implementation Strategy**

**Phase 1: Basic Connection**
- Install Socket.IO client library
- Create connection function with JWT token
- Show connection status (green = connected, red = disconnected)
- Handle connection errors gracefully

**Phase 2: Event Handlers**
- Implement 7 event listeners for different update types
- Connect each event to specific UI components
- Add visual feedback when events are received

**Phase 3: UI Integration**
- Map component listens for `map:update` events
- Alerts panel listens for `alert:new` and `alert:updated`
- AI widget listens for `insight:update` and `prediction:update`
- Action panel listens for `action:created`
- Reports panel listens for `report:new`

**Phase 4: Error Handling & Fallback**
- Detect when WebSocket disconnects
- Fall back to regular API polling (every 30 seconds)
- Automatically reconnect when network returns
- Handle token expiration gracefully

#### **5. Frontend Development Workflow**

**Step 1: Install Dependencies**
```bash
npm install socket.io-client
```

**Step 2: Create WebSocket Service**
- Create connection function
- Handle authentication with JWT
- Manage connection states

**Step 3: Integrate with React Components**
- Map component subscribes to location updates
- Alert panel subscribes to alert events
- AI widget subscribes to insight updates

**Step 4: Add Visual Indicators**
- Connection status indicator (green/red dot)
- "Live" badges when data updates
- Loading states during reconnection

**Step 5: Test Real-time Features**
- Test each event type manually
- Verify multiple browser tabs update simultaneously
- Test network disconnection scenarios

#### **6. User Experience Benefits**

**For Control Room Operators:**
- **Instant Alerts**: No delay when crowds become dangerous
- **Live Situational Awareness**: Map shows real-time crowd movement
- **Synchronized Actions**: All operators see the same information
- **Immediate Feedback**: Actions are confirmed instantly across all screens

**For Field Personnel:**
- **Quick Response**: Incident reports appear immediately on operator screens
- **Coordinated Actions**: All teams see operator decisions in real-time
- **Live Updates**: Camera feeds and location data stream continuously

#### **7. Technical Benefits**

**Performance:**
- **Efficient**: No constant polling - data sent only when changed
- **Scalable**: One server can handle many connected dashboards
- **Responsive**: Updates appear in milliseconds, not seconds

**Reliability:**
- **Fallback**: Automatic switch to API polling if WebSocket fails
- **Reconnection**: Automatic reconnection when network restored
- **Persistence**: No data lost during temporary disconnections

#### **8. Data Flow Summary**

**Real-time Events Flow:**
```
📊 Data Changes → 🖥️ Backend Processing → 📡 WebSocket Broadcast → 📱 All Connected Frontends Update
```

**Specific Examples:**
- **New Person Detected** → Instant map heatmap update
- **Crowd Threshold Exceeded** → Immediate alert on all operator screens  
- **AI Risk Increases** → Live risk meter updates everywhere
- **Gate Opened** → Real-time action confirmation to all operators
- **Incident Reported** → Instant notification to control room

This real-time system transforms CrowdShield AI from a **static dashboard** into a **live command center** where operators can respond to crowd situations as they happen, not after they've already escalated.

---

## 📡 Overview
This document explains how WebSocket communication works between the frontend and backend in CrowdShield AI for real-time updates. The backend already has Socket.IO implemented, and this guide shows how frontend should connect and handle real-time events.

---

## 🏗️ **Backend WebSocket Setup (Already Implemented)**

### Socket.IO Server Configuration
- **Library**: Socket.IO with CORS support
- **Namespace**: Default namespace `/` 
- **Rooms**: Event-based rooms (`event:${eventId}`)
- **Authentication**: JWT token verification on connection
- **Endpoint**: Same port as HTTP API (8080)

### Backend Architecture
```
HTTP Server (Port 8080)
├── Express API Routes
└── Socket.IO Server
    ├── Authentication Middleware
    ├── Event Rooms (event:123, event:456)
    └── Real-time Event Emitters
```

---

## 🔐 **Authentication & Connection**

### Backend Authentication (Already Implemented)
- **Token Source**: `socket.handshake.auth.token` or `socket.handshake.query.token`
- **Verification**: Uses same JWT verification as API routes
- **Room Joining**: Automatically joins `event:${eventId}` room if eventId provided
- **User Context**: Stores verified user info in `socket.user`

### Connection Security
- **CORS**: Restricted to `FRONTEND_ORIGIN` environment variable
- **Token Required**: Unauthorized connections are rejected
- **Event Isolation**: Users only receive events for their joined event rooms

---

## 📤 **Backend Event Emissions (Already Implemented)**

### Emission Pattern
All backend controllers use this pattern:
```javascript
const ioApi = req.app.get('ioApi');
ioApi.emitToEvent(eventId, 'event:name', payload);
```

### Real-time Events Emitted by Backend

| Event | Triggered By | Controller | Payload |
|-------|--------------|------------|---------|
| `map:update` | New location ping | pings.controller.js | `{points: [...], density: [], updatedAt, source}` |
| `alert:new` | Crowd threshold exceeded | cctv.controller.js | `{id, type, message, severity, createdAt}` |
| `alert:updated` | Alert resolved | alerts.controller.js | `{id, status, resolvedAt}` |
| `insight:update` | AI insights requested | ai.controller.js | `{riskScore, recommendation, confidence, factors}` |
| `prediction:update` | AI predictions requested | ai.controller.js | `{horizonMinutes, predictions: [...]}` |
| `action:created` | Operator action taken | actions.controller.js | `{id, eventId, command, zoneId, createdBy, createdAt}` |
| `report:new` | Incident report submitted | reports.controller.js | `{id, message, type, createdAt}` |

---

## 🌐 **Frontend WebSocket Implementation**

### Connection Setup
**When**: User logs in and enters dashboard
**Library**: Socket.IO Client
**URL**: Same as API base URL

### Frontend Connection Code
```javascript
import { io } from 'socket.io-client';

// Connect to WebSocket
const connectToWebSocket = (eventId, authToken) => {
  const socket = io('http://localhost:8080', {
    auth: {
      token: authToken
    },
    query: {
      eventId: eventId
    }
  });
  
  return socket;
};
```

### Connection States
- **Connected**: Green indicator, real-time updates active
- **Disconnected**: Red indicator, fallback to API polling
- **Reconnecting**: Yellow indicator, attempting to reconnect

---

## 📨 **Frontend Event Handlers**

### Map Updates
**Purpose**: Update heatmap and location points in real-time
```javascript
socket.on('map:update', (data) => {
  // data: {points: [...], density: [], updatedAt, source}
  updateMapHeatmap(data.points);
  updateDensityOverlay(data.density);
  showLastUpdated(data.updatedAt);
});
```

### Alert Management
**Purpose**: Show new alerts and update alert status
```javascript
// New alert notification
socket.on('alert:new', (alert) => {
  // alert: {id, type, message, severity, createdAt}
  addAlertToPanel(alert);
  showNotification(`${alert.severity.toUpperCase()} ALERT: ${alert.message}`);
  highlightZoneOnMap(alert.zoneId);
});

// Alert status update
socket.on('alert:updated', (update) => {
  // update: {id, status, resolvedAt}
  updateAlertStatus(update.id, update.status);
  if (update.status === 'resolved') {
    showSuccessMessage('Alert resolved');
  }
});
```

### AI Insights
**Purpose**: Update AI widget with new risk assessments
```javascript
socket.on('insight:update', (insights) => {
  // insights: {riskScore, recommendation, confidence, factors}
  updateRiskMeter(insights.riskScore);
  updateRecommendationText(insights.recommendation);
  updateConfidenceIndicator(insights.confidence);
  updateMLStatus(insights.mlStatus);
});
```

### AI Predictions
**Purpose**: Update map zone colors based on predictions
```javascript
socket.on('prediction:update', (predictions) => {
  // predictions: {horizonMinutes, predictions: [...]}
  predictions.predictions.forEach(pred => {
    updateZoneColor(pred.zoneId, pred.risk);
  });
  updatePredictionTimestamp(predictions.generatedAt);
});
```

### Operator Actions
**Purpose**: Show action history and confirmations
```javascript
socket.on('action:created', (action) => {
  // action: {id, eventId, command, zoneId, createdBy, createdAt}
  addActionToHistory(action);
  showActionConfirmation(`Action executed: ${action.command}`);
  logOperatorActivity(action);
});
```

### Reports
**Purpose**: Show new incident reports
```javascript
socket.on('report:new', (report) => {
  // report: {id, message, type, createdAt}
  addReportToPanel(report);
  showNotification(`New ${report.type} report received`);
  updateReportCounter();
});
```

---

## 🔄 **Connection Management**

### Frontend Connection Lifecycle
```javascript
const socket = connectToWebSocket(eventId, authToken);

// Connection events
socket.on('connect', () => {
  setConnectionStatus('connected');
  stopAPIPolling(); // Stop fallback polling
});

socket.on('disconnect', () => {
  setConnectionStatus('disconnected');
  startAPIPolling(); // Start fallback polling
});

socket.on('connect_error', (error) => {
  if (error.message === 'Unauthorized') {
    // Token expired, redirect to login
    logout();
  } else {
    setConnectionStatus('error');
    startAPIPolling();
  }
});
```

### Reconnection Strategy
- **Automatic**: Socket.IO handles automatic reconnection
- **Fallback**: Switch to API polling when disconnected
- **Token Refresh**: Handle token expiration gracefully

---

## 📊 **Data Flow Examples**

### Camera Detection Flow
```
1. Frontend Camera → Detects 35 people
2. Frontend → POST /api/v1/cctv/objects
3. Backend → Threshold exceeded (30+)
4. Backend → Creates alert in database
5. Backend → Emits 'alert:new' via WebSocket
6. Frontend → Receives alert, shows notification
7. Frontend → Updates alerts panel
8. Frontend → Highlights zone on map
```

### Location Ping Flow
```
1. Frontend → GPS location update
2. Frontend → POST /api/v1/pings
3. Backend → Stores ping in database
4. Backend → Emits 'map:update' via WebSocket
5. Frontend → Receives new point
6. Frontend → Updates heatmap visualization
7. Frontend → Shows "Live" indicator
```

### Operator Action Flow
```
1. Frontend → User clicks "Open Gate 3"
2. Frontend → POST /api/v1/actions
3. Backend → Stores action in database
4. Backend → Emits 'action:created' via WebSocket
5. All Connected Clients → Receive action update
6. Frontend → Shows "Action Executed" confirmation
7. Frontend → Updates action history panel
```

---

## ⚡ **Performance Considerations**

### Event Throttling
- **Map Updates**: Limit to 1 update per second maximum
- **Batch Updates**: Group multiple pings into single emission
- **Selective Rooms**: Only emit to relevant event rooms

### Frontend Optimization
- **Event Debouncing**: Debounce rapid UI updates
- **Selective Listening**: Only subscribe to needed events
- **Memory Management**: Clean up event listeners on unmount

### Fallback Strategy
- **API Polling**: Fall back to REST API when WebSocket disconnected
- **Progressive Enhancement**: App works without WebSocket
- **Graceful Degradation**: Show connection status to users

---

## 🧪 **Testing WebSocket Implementation**

### Backend Testing (Already Works)
```bash
# Test WebSocket connection
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:8080', {
  auth: { token: 'YOUR_JWT_TOKEN' },
  query: { eventId: '689eef4e6ce7f476939b7f8c' }
});
socket.on('connect', () => console.log('Connected'));
socket.on('map:update', (data) => console.log('Map update:', data));
"
```

### Frontend Testing
- **Connection Status**: Verify green/red indicators
- **Event Reception**: Test each event type manually
- **Reconnection**: Test network interruption scenarios
- **Multiple Tabs**: Verify all tabs receive updates

---

## 🔧 **Frontend Implementation Checklist**

### Required Libraries
```bash
npm install socket.io-client
```

### Core Implementation
- [ ] Socket connection with auth token
- [ ] Event room joining with eventId
- [ ] Connection status indicators
- [ ] All 7 event handlers implemented
- [ ] Graceful disconnection handling
- [ ] Fallback to API polling

### UI Integration
- [ ] Real-time map updates
- [ ] Live alert notifications
- [ ] AI widget auto-refresh
- [ ] Action confirmation messages
- [ ] Report notifications
- [ ] Connection status display

### Error Handling
- [ ] Token expiration handling
- [ ] Connection error recovery
- [ ] Network interruption handling
- [ ] Graceful degradation

---

## 🎯 **Summary**

**Backend**: Already fully implemented with Socket.IO, JWT auth, event rooms, and 7 real-time events

**Frontend**: Needs to implement Socket.IO client with:
1. **Connection** with JWT token and eventId
2. **7 Event Handlers** for real-time updates
3. **UI Integration** to show live data
4. **Error Handling** for connection issues
5. **Fallback Strategy** when WebSocket unavailable

**Result**: Real-time dashboard that updates instantly when:
- New people detected by camera
- Location pings received
- AI insights generated
- Alerts created/resolved
- Actions taken by operators
- Reports submitted

The WebSocket implementation enables a truly **live dashboard** experience where all operators see updates simultaneously without refreshing pages!
