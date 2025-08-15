# 🎯 Frontend Implementation Guide - Admin vs Staff Workflows

## 📋 **ID Usage & Frontend Architecture**

### **🆔 How IDs Are Used in Frontend**

```typescript
// IDs from your seed data
const SYSTEM_IDS = {
  adminUserId: "689f37c40af9788447936aae",
  staffUserId: "689f37c40af9788447936ab0", 
  eventId: "689f37c40af9788447936ab2",
  zoneId: "689f37c40af9788447936ab4"
};

// After login, you get user role and redirect accordingly
const handleLoginSuccess = (response: AuthResponse) => {
  const { token, user } = response;
  
  // Store authentication data
  localStorage.setItem('authToken', token);
  localStorage.setItem('userId', user.id);
  localStorage.setItem('userRole', user.role);
  localStorage.setItem('userName', user.name);
  
  // Use eventId for all API calls
  localStorage.setItem('currentEventId', SYSTEM_IDS.eventId);
  
  // Redirect based on role
  if (user.id === SYSTEM_IDS.adminUserId) {
    navigate('/admin-dashboard');
  } else if (user.id === SYSTEM_IDS.staffUserId) {
    navigate('/staff-dashboard');
  }
};
```

---

## 🏗️ **TWO DIFFERENT FRONTEND ARCHITECTURES**

### **🎨 Frontend Structure**
```
src/
├── components/
│   ├── common/          # Shared components
│   │   ├── LoginForm.tsx
│   │   ├── MapView.tsx
│   │   └── Header.tsx
│   ├── admin/           # Admin-only components
│   │   ├── UserManagement.tsx
│   │   ├── AIInsights.tsx
│   │   ├── SystemMetrics.tsx
│   │   └── AdvancedReports.tsx
│   └── staff/           # Staff-only components
│       ├── AlertMonitor.tsx
│       ├── ActionSubmission.tsx
│       └── BasicReports.tsx
├── pages/
│   ├── AdminDashboard.tsx    # Full-featured admin interface
│   ├── StaffDashboard.tsx    # Limited staff interface
│   └── LoginPage.tsx
└── utils/
    ├── auth.ts          # Authentication utilities
    ├── api.ts           # API calling functions
    └── permissions.ts   # Permission checking
```

---

## 👑 **ADMIN DASHBOARD WORKFLOW**

### **Admin Dashboard Layout**
```typescript
// AdminDashboard.tsx
import React, { useEffect, useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  
  const eventId = localStorage.getItem('currentEventId');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    // Load all admin data
    await Promise.all([
      loadUsers(),
      loadSystemMetrics(), 
      loadAIInsights(),
      loadAlerts(),
      loadMapData()
    ]);
  };

  return (
    <div className="admin-dashboard">
      <Header userRole="admin" />
      
      <div className="dashboard-grid">
        {/* Row 1: System Overview */}
        <SystemMetricsPanel data={systemMetrics} />
        <AIInsightsPanel data={aiInsights} eventId={eventId} />
        
        {/* Row 2: Management Panels */}
        <UserManagementPanel users={users} />
        <AlertManagementPanel eventId={eventId} />
        
        {/* Row 3: Map and Reports */}
        <MapView eventId={eventId} userRole="admin" />
        <AdvancedReportsPanel />
      </div>
    </div>
  );
};
```

### **🔑 Admin API Endpoints & Data Flow**

#### **1. After Admin Login**
```typescript
// What admin sends after login
const adminLogin = async () => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@crowdshield.ai',
      password: 'admin123!'
    })
  });
  
  const data = await response.json();
  // Admin gets: { token, user: { id: "689f37c40af9788447936aae", role: "admin" } }
};
```

#### **2. Admin Data Loading Sequence**
```typescript
// 1. Load User Management Data
const loadUsers = async () => {
  const response = await fetch('/api/v1/users', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // List of all users
};

// 2. Load System Metrics (Admin Only)
const loadSystemMetrics = async () => {
  const response = await fetch('/api/v1/system-health/metrics', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // Detailed system data
};

// 3. Load AI Insights (Admin Only)
const loadAIInsights = async () => {
  const response = await fetch(`/api/v1/ai-insights?eventId=${eventId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // AI risk scores and recommendations
};

// 4. Load Map Data (Full Access)
const loadMapData = async () => {
  const response = await fetch(`/api/v1/map-data?eventId=${eventId}&windowSec=300`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // All location points and density
};

// 5. Load Alerts (Full Management)
const loadAlerts = async () => {
  const response = await fetch(`/api/v1/alerts?eventId=${eventId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // All alerts with management capabilities
};
```

#### **3. Admin Actions & Data Sending**
```typescript
// Create New User
const createUser = async (userData: UserData) => {
  await fetch('/api/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.tempPassword,
      role: userData.role // "admin" or "staff"
    })
  });
};

// Submit Admin Action
const submitAdminAction = async (actionData: AdminAction) => {
  await fetch('/api/v1/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      eventId: eventId,
      type: actionData.type, // "system_config", "user_action", "alert_rule"
      description: actionData.description,
      metadata: {
        userId: localStorage.getItem('userId'),
        targetZone: actionData.zoneId,
        priority: actionData.priority,
        adminOverride: true
      }
    })
  });
};

// Export Data (Admin Only)
const exportReports = async (exportType: string) => {
  const response = await fetch(`/api/v1/export/reports?type=${exportType}&eventId=${eventId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.blob(); // CSV/Excel download
};
```

---

## 👥 **STAFF DASHBOARD WORKFLOW**

### **Staff Dashboard Layout**
```typescript
// StaffDashboard.tsx
import React, { useEffect, useState } from 'react';

const StaffDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [reports, setReports] = useState([]);
  
  const eventId = localStorage.getItem('currentEventId');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    // Load only staff-accessible data
    await Promise.all([
      loadAlerts(),
      loadMapData(),
      loadBasicReports()
    ]);
  };

  return (
    <div className="staff-dashboard">
      <Header userRole="staff" />
      
      <div className="operational-layout">
        {/* Main Map View */}
        <MapView eventId={eventId} userRole="staff" />
        
        {/* Operational Panels */}
        <div className="side-panels">
          <AlertMonitorPanel alerts={alerts} />
          <ActionSubmissionPanel eventId={eventId} />
          <BasicReportsPanel reports={reports} />
          <LocationPingPanel eventId={eventId} />
        </div>
      </div>
    </div>
  );
};
```

### **🔧 Staff API Endpoints & Data Flow**

#### **1. After Staff Login**
```typescript
// What staff sends after login
const staffLogin = async () => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'staff@crowdshield.ai',
      password: 'staff123!'
    })
  });
  
  const data = await response.json();
  // Staff gets: { token, user: { id: "689f37c40af9788447936ab0", role: "staff" } }
};
```

#### **2. Staff Data Loading (LIMITED)**
```typescript
// 1. Load Alerts (View Only)
const loadAlerts = async () => {
  const response = await fetch(`/api/v1/alerts?eventId=${eventId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // Can view but not configure alert rules
};

// 2. Load Map Data (Basic Access)
const loadMapData = async () => {
  const response = await fetch(`/api/v1/map-data?eventId=${eventId}&windowSec=300`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // Same map data but limited UI controls
};

// 3. Load Basic Reports (Own Reports Only)
const loadBasicReports = async () => {
  const response = await fetch(`/api/v1/reports?eventId=${eventId}&createdBy=${userId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return response.json(); // Only their own reports
};

// ❌ Staff CANNOT access:
// - /api/v1/users (403 Forbidden)
// - /api/v1/ai-insights (403 Forbidden)
// - /api/v1/system-health/metrics (403 Forbidden)
```

#### **3. Staff Actions & Data Sending (OPERATIONAL)**
```typescript
// Acknowledge Alert
const acknowledgeAlert = async (alertId: string) => {
  await fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      acknowledgedBy: localStorage.getItem('userId'),
      acknowledgedAt: new Date().toISOString(),
      notes: "Alert acknowledged by field staff"
    })
  });
};

// Submit Operational Action
const submitStaffAction = async (actionData: StaffAction) => {
  await fetch('/api/v1/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      eventId: eventId,
      type: actionData.type, // "response", "patrol", "assistance"
      description: actionData.description,
      location: actionData.coordinates,
      metadata: {
        staffId: localStorage.getItem('userId'),
        responseTime: actionData.responseTime,
        severity: actionData.severity
      }
    })
  });
};

// Send Location Ping
const sendLocationPing = async (location: LocationData) => {
  await fetch('/api/v1/pings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      eventId: eventId,
      userId: localStorage.getItem('userId'),
      location: {
        type: "Point",
        coordinates: [location.longitude, location.latitude]
      },
      timestamp: new Date().toISOString(),
      status: location.status, // "available", "busy", "emergency"
      message: location.message
    })
  });
};

// Submit Camera Detection Data
const submitCameraData = async (detectionData: CameraDetection) => {
  await fetch('/api/v1/cctv/objects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      cameraId: detectionData.cameraId,
      eventId: eventId,
      objects: detectionData.detectedObjects.map(obj => ({
        type: obj.type, // "person", "vehicle", "crowd"
        confidence: obj.confidence,
        bbox: obj.boundingBox,
        timestamp: new Date().toISOString()
      }))
    })
  });
};

// Create Basic Report
const createReport = async (reportData: BasicReport) => {
  await fetch('/api/v1/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      eventId: eventId,
      title: reportData.title,
      description: reportData.description,
      type: reportData.type, // "incident", "observation", "maintenance"
      location: reportData.coordinates,
      createdBy: localStorage.getItem('userId'),
      severity: reportData.severity,
      attachments: reportData.photos // Base64 encoded images
    })
  });
};
```

---

## 🔄 **COMPLETE WORKFLOW COMPARISON**

### **📊 Data Flow Summary**

| **Action** | **Admin Workflow** | **Staff Workflow** |
|------------|-------------------|-------------------|
| **After Login** | Load user management, AI insights, system metrics, full map, alerts | Load basic map, alerts (view-only), own reports |
| **Main Activities** | Create users, configure system, view AI predictions, export data | Monitor alerts, submit actions, send location pings, create reports |
| **Data Sent** | User creation data, system configurations, admin actions, export requests | Operational actions, location pings, camera data, basic reports |
| **Map Interaction** | Full zone management, alert rule creation, advanced analytics | View-only map, basic location marking, status updates |
| **Alert Handling** | Create/modify/delete alert rules, advanced alert analytics | View and acknowledge alerts only |
| **Reporting** | Access all reports, export capabilities, advanced filtering | Create basic reports, view own reports only |

### **🎯 Key Differences in Implementation**

#### **Admin Dashboard Features:**
```typescript
// Admin-specific components
<UserManagementPanel />      // Create, edit, delete users
<AIInsightsPanel />          // View AI predictions and insights  
<SystemMetricsPanel />       // Detailed system performance
<AdvancedReportsPanel />     // All reports + export functionality
<AlertConfigPanel />         // Create and modify alert rules
<DataExportPanel />          // Export system data
```

#### **Staff Dashboard Features:**
```typescript
// Staff-specific components  
<AlertMonitorPanel />        // View and acknowledge alerts
<ActionSubmissionPanel />    // Submit operational actions
<LocationPingPanel />        // Send location updates
<BasicReportsPanel />        // Create simple incident reports
<CameraFeedPanel />          // View camera feeds and submit detections
```

### **🔐 Permission Enforcement in Frontend**
```typescript
// Permission checking utility
const hasPermission = (permission: string): boolean => {
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'admin') return true; // Admin has all permissions
  
  const allowedStaffPermissions = [
    'VIEW_ALERTS', 'ACKNOWLEDGE_ALERTS', 'SUBMIT_ACTIONS',
    'LOCATION_PINGS', 'BASIC_REPORTS', 'VIEW_CAMERA_FEEDS'
  ];
  
  return userRole === 'staff' && allowedStaffPermissions.includes(permission);
};

// Component rendering based on permissions
const ConditionalComponent = ({ permission, children }) => {
  if (!hasPermission(permission)) return null;
  return <>{children}</>;
};
```

### **🚀 Final Implementation Steps**

1. **Build Login Page** - Single form that detects role and redirects
2. **Create Admin Dashboard** - Full-featured interface with all admin tools
3. **Create Staff Dashboard** - Operational interface with limited permissions  
4. **Implement Role Guards** - Prevent unauthorized access to admin features
5. **Add Error Handling** - Handle 403 permission errors gracefully
6. **Test Both Workflows** - Verify admin and staff experiences work correctly

This architecture gives you **two completely different user experiences** while sharing common components and maintaining proper security boundaries! 🎯
