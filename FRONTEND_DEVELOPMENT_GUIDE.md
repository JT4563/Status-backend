# CrowdShield AI - Frontend Development Guide

## 🎯 Overview
This guide provides complete frontend development specifications for building the CrowdShield AI dashboard. The frontend is a **React + Tailwind CSS** application that provides real-time crowd monitoring, AI insights, and operator controls.

---

## 🎨 UI/UX Design Requirements

### Design Philosophy
- **Clean, Professional Dashboard**: Focus on clarity and quick decision-making
- **Real-time First**: All data should update live without page refreshes
- **Mobile Responsive**: Works on tablets and mobile devices for field operators
- **High Contrast**: Easy to read in various lighting conditions
- **Color-coded Alerts**: Intuitive visual hierarchy for urgency levels

### Color Scheme
```css
/* Primary Colors */
--primary-blue: #2563eb     /* Buttons, links */
--primary-dark: #1e40af     /* Hover states */

/* Status Colors */
--success-green: #10b981    /* Safe zones, resolved alerts */
--warning-orange: #f59e0b   /* Medium risk, warnings */
--danger-red: #ef4444       /* High risk, active alerts */
--info-blue: #3b82f6        /* Information, neutral states */

/* Background Colors */
--bg-primary: #ffffff       /* Main background */
--bg-secondary: #f8fafc     /* Card backgrounds */
--bg-dark: #1e293b          /* Dark mode (optional) */

/* Text Colors */
--text-primary: #0f172a     /* Main text */
--text-secondary: #64748b   /* Secondary text */
--text-muted: #94a3b8       /* Muted text */
```

---

## 🏗️ Application Architecture

### Tech Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer (or Redux Toolkit)
- **Maps**: React Leaflet or Mapbox GL JS
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Charts**: Chart.js or Recharts
- **Icons**: Heroicons or Lucide React

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Modal, etc.)
│   ├── map/             # Map-related components
│   ├── alerts/          # Alert management components
│   ├── ai/              # AI insights components
│   └── reports/         # Report components
├── pages/               # Page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Login.tsx        # Login page
│   └── Reports.tsx      # Reports page
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useSocket.ts     # WebSocket hook
│   └── useApi.ts        # API hook
├── services/            # API services
│   ├── api.ts           # HTTP client setup
│   ├── auth.service.ts  # Authentication API
│   └── socket.service.ts # WebSocket service
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Auth state
│   ├── EventContext.tsx # Current event state
│   └── SocketContext.tsx # WebSocket state
├── types/               # TypeScript type definitions
│   ├── api.types.ts     # API response types
│   ├── auth.types.ts    # Auth types
│   └── map.types.ts     # Map data types
├── utils/               # Utility functions
│   ├── constants.ts     # App constants
│   ├── formatters.ts    # Data formatting
│   └── helpers.ts       # Helper functions
└── styles/              # Global styles
    └── globals.css      # Tailwind imports + custom CSS
```

---

## 📱 Page Layouts & Components

### 1. Login Page (`/login`)

#### Design Requirements
- **Clean, centered form** with CrowdShield branding
- **Minimal design** - logo, email/password fields, login button
- **Error handling** - display invalid credentials clearly
- **Responsive** - works on mobile devices

#### Component Structure
```tsx
// src/pages/Login.tsx
export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
}
```

#### Components to Build
- `LoginHeader`: Logo and title
- `LoginForm`: Email/password inputs with validation
- `LoginFooter`: Links to help/support

---

### 2. Main Dashboard (`/dashboard`)

#### Layout Structure
```
┌─────────────────────────────────────────┐
│               Top Navigation             │
├─────────────┬─────────────┬─────────────┤
│             │             │             │
│    Map      │   Alerts    │ AI Insights │
│   (60%)     │   Panel     │   Widget    │
│             │   (20%)     │   (20%)     │
│             │             │             │
├─────────────┼─────────────┼─────────────┤
│         Actions Panel     │   Reports   │
│           (60%)           │   (40%)     │
└─────────────┴─────────────┴─────────────┘
```

#### Component Breakdown

##### Top Navigation Bar
```tsx
// src/components/common/TopNavigation.tsx
function TopNavigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
          <EventSelector />
          <ConnectionStatus />
        </div>
        <div className="flex items-center space-x-4">
          <NotificationIcon />
          <UserProfile />
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
```

**Features to implement:**
- **Event Selector**: Dropdown to switch between events
- **Connection Status**: Green/red indicator for WebSocket connection
- **Notification Icon**: Badge showing unread alerts count
- **User Profile**: Show current user name and role

---

### 3. Interactive Map Component

#### Design Requirements
- **Full-screen map** as the main focus
- **Real-time heatmap** showing crowd density
- **Zone overlays** with color-coded risk levels
- **Alert markers** positioned at incident locations
- **Zoom controls** and layer toggles

#### Component Structure
```tsx
// src/components/map/CrowdMap.tsx
function CrowdMap() {
  return (
    <div className="relative h-full bg-gray-100 rounded-lg overflow-hidden">
      <MapContainer>
        <HeatmapLayer data={densityData} />
        <ZoneLayer zones={zones} />
        <AlertMarkers alerts={activeAlerts} />
        <LocationPings pings={recentPings} />
      </MapContainer>
      <MapControls />
      <MapLegend />
    </div>
  );
}
```

#### Sub-components to Build

##### Heatmap Layer
- **Density visualization** using color gradients
- **Real-time updates** when new ping data arrives
- **Smooth animations** for data changes

##### Zone Overlays
- **Polygon shapes** for each zone
- **Color coding** based on current risk level:
  - 🟢 Green: Low risk (0-0.3)
  - 🟡 Yellow: Medium risk (0.3-0.7)
  - 🔴 Red: High risk (0.7-1.0)
- **Click interactions** to show zone details

##### Alert Markers
- **Custom icons** for different alert types
- **Pulsing animation** for active alerts
- **Popup details** on click

##### Map Controls
```tsx
// src/components/map/MapControls.tsx
function MapControls() {
  return (
    <div className="absolute top-4 right-4 space-y-2">
      <LayerToggle />
      <ZoomControls />
      <FullscreenButton />
    </div>
  );
}
```

##### Map Legend
```tsx
// src/components/map/MapLegend.tsx
function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
      <h4 className="font-semibold mb-2">Risk Levels</h4>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Low Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Medium Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">High Risk</span>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Alerts Panel

#### Design Requirements
- **Scrollable list** of current alerts
- **Priority sorting** (high to low)
- **Status indicators** (active, resolved)
- **Quick actions** (resolve, details)
- **Real-time updates** with smooth animations

#### Component Structure
```tsx
// src/components/alerts/AlertsPanel.tsx
function AlertsPanel() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <AlertsHeader />
      <AlertsList />
    </div>
  );
}
```

#### Alert Card Design
```tsx
// src/components/alerts/AlertCard.tsx
function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div className={`border-l-4 p-3 mb-3 rounded-r-lg ${
      alert.severity === 'high' ? 'border-red-500 bg-red-50' :
      alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
      'border-blue-500 bg-blue-50'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <AlertIcon severity={alert.severity} />
            <span className="font-semibold text-sm">
              {alert.type.toUpperCase()}
            </span>
            <StatusBadge status={alert.status} />
          </div>
          <p className="text-gray-700 text-sm mt-1">{alert.message}</p>
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>{formatTimeAgo(alert.createdAt)}</span>
            {alert.zoneId && (
              <>
                <span className="mx-2">•</span>
                <span>Zone {alert.zoneId}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <ResolveButton alertId={alert.id} />
          <DetailsButton alert={alert} />
        </div>
      </div>
    </div>
  );
}
```

---

### 5. AI Insights Widget

#### Design Requirements
- **Risk meter** showing current risk score
- **Recommendation text** with clear actions
- **Confidence indicator** showing AI certainty
- **Status indicator** for ML service health
- **Auto-refresh** with loading states

#### Component Structure
```tsx
// src/components/ai/AIInsightsWidget.tsx
function AIInsightsWidget() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <AIHeader />
      <RiskMeter />
      <RecommendationCard />
      <ConfidenceIndicator />
      <MLStatusIndicator />
    </div>
  );
}
```

#### Risk Meter Component
```tsx
// src/components/ai/RiskMeter.tsx
function RiskMeter({ riskScore }: { riskScore: number }) {
  const percentage = riskScore * 100;
  const color = riskScore > 0.7 ? 'red' : riskScore > 0.3 ? 'yellow' : 'green';
  
  return (
    <div className="text-center mb-4">
      <div className="relative w-24 h-24 mx-auto">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48" cy="48" r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="48" cy="48" r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2.51 * percentage} 251`}
            className={`text-${color}-500`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">Current Risk Level</p>
    </div>
  );
}
```

---

### 6. Actions Panel

#### Design Requirements
- **Quick action buttons** for common operations
- **Action history** showing recent commands
- **Input forms** for custom actions
- **Confirmation dialogs** for critical actions

#### Component Structure
```tsx
// src/components/actions/ActionsPanel.tsx
function ActionsPanel() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <QuickActions />
      <ActionHistory />
    </div>
  );
}
```

#### Quick Actions Component
```tsx
// src/components/actions/QuickActions.tsx
function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <ActionButton
        icon={<GateIcon />}
        label="Open Gate"
        action="open_gate"
        color="blue"
      />
      <ActionButton
        icon={<AlertIcon />}
        label="Send Alert"
        action="send_alert"
        color="red"
      />
      <ActionButton
        icon={<UsersIcon />}
        label="Dispatch Staff"
        action="dispatch"
        color="green"
      />
    </div>
  );
}
```

---

### 7. Reports Panel

#### Design Requirements
- **Report submission form** for new incidents
- **Recent reports list** with status indicators
- **Filter options** by type and time
- **Anonymous submissions** support

#### Component Structure
```tsx
// src/components/reports/ReportsPanel.tsx
function ReportsPanel() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <ReportForm />
      <RecentReports />
    </div>
  );
}
```

---

## 🔌 API Integration Patterns

### Authentication Hook
```tsx
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem('authToken', token);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return { user, token, login, logout, isAuthenticated: !!token };
}
```

### WebSocket Hook
```tsx
// src/hooks/useSocket.ts
export function useSocket(eventId: string) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !eventId) return;

    const socketInstance = io('/realtime', {
      auth: { token },
      query: { eventId }
    });

    socketInstance.on('connect', () => setConnected(true));
    socketInstance.on('disconnect', () => setConnected(false));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, eventId]);

  const subscribe = (event: string, callback: (data: any) => void) => {
    socket?.on(event, callback);
  };

  const unsubscribe = (event: string) => {
    socket?.off(event);
  };

  return { socket, connected, subscribe, unsubscribe };
}
```

### API Hook
```tsx
// src/hooks/useApi.ts
export function useApi() {
  const { token } = useAuth();

  const apiCall = async <T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  };

  return { apiCall };
}
```

---

## 📊 State Management

### Event Context
```tsx
// src/context/EventContext.tsx
interface EventContextType {
  currentEvent: Event | null;
  setCurrentEvent: (event: Event) => void;
  alerts: Alert[];
  reports: Report[];
  aiInsights: AIInsights | null;
  mapData: MapData | null;
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(eventReducer, initialState);
  const { subscribe } = useSocket(state.currentEvent?.id || '');

  // Subscribe to real-time updates
  useEffect(() => {
    subscribe('alert:new', (alert: Alert) => {
      dispatch({ type: 'ADD_ALERT', payload: alert });
    });

    subscribe('map:update', (mapData: MapData) => {
      dispatch({ type: 'UPDATE_MAP_DATA', payload: mapData });
    });

    subscribe('insight:update', (insights: AIInsights) => {
      dispatch({ type: 'UPDATE_AI_INSIGHTS', payload: insights });
    });
  }, [subscribe]);

  return (
    <EventContext.Provider value={{ ...state, dispatch }}>
      {children}
    </EventContext.Provider>
  );
}
```

---

## 🎨 UI Components Library

### Button Component
```tsx
// src/components/common/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant, 
  size, 
  loading, 
  disabled, 
  icon, 
  children, 
  onClick 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Spinner className="w-4 h-4 mr-2" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
```

### Modal Component
```tsx
// src/components/common/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📱 Responsive Design Guidelines

### Breakpoints
```css
/* Mobile First Approach */
/* xs: 0px */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

### Mobile Layout Adaptations
- **Stack panels vertically** on mobile
- **Collapsible side panels** with hamburger menu
- **Touch-friendly buttons** (minimum 44px)
- **Simplified map controls** for touch interaction
- **Bottom navigation** for quick access to main sections

### Tablet Layout
- **Two-column layout** with map on left, panels on right
- **Expandable panels** that can overlay the map
- **Gesture support** for map navigation

---

## 🚀 Performance Optimization

### Code Splitting
```tsx
// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MapComponent = lazy(() => import('./components/map/CrowdMap'));

// Use React.Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### WebSocket Optimization
- **Throttle rapid updates** to prevent UI blocking
- **Batch state updates** using React 18's automatic batching
- **Disconnect on page blur** to save resources

### Map Performance
- **Cluster markers** when zoomed out
- **Virtualize large datasets** for heatmap
- **Debounce zoom/pan events** for API calls

---

## 🧪 Testing Strategy

### Component Testing
```tsx
// src/components/__tests__/AlertCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertCard } from '../alerts/AlertCard';

describe('AlertCard', () => {
  it('displays alert information correctly', () => {
    const alert = {
      id: '1',
      type: 'overcrowd',
      message: 'High density detected',
      severity: 'high',
      status: 'active',
      createdAt: '2025-08-15T08:00:00Z'
    };

    render(<AlertCard alert={alert} />);
    
    expect(screen.getByText('OVERCROWD')).toBeInTheDocument();
    expect(screen.getByText('High density detected')).toBeInTheDocument();
  });

  it('calls resolve function when resolve button is clicked', () => {
    const mockResolve = jest.fn();
    // Test implementation...
  });
});
```

### Integration Testing
- **API integration tests** with mock endpoints
- **WebSocket connection tests** with mock socket server
- **Authentication flow tests** end-to-end

---

## 📚 Development Workflow

### Getting Started
1. **Clone the repository** and install dependencies
2. **Copy environment file**: `cp .env.example .env.local`
3. **Start development server**: `npm run dev`
4. **Start backend API** and ensure connection

### Development Standards
- **TypeScript strict mode** enabled
- **ESLint + Prettier** for code formatting
- **Conventional commits** for clear git history
- **Component documentation** with Storybook (optional)

### Environment Variables
```env
# .env.local
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_SOCKET_URL=http://localhost:8080
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

---

## 🎯 Implementation Priorities

### Phase 1: Core Dashboard (Week 1-2)
1. ✅ Authentication system and login page
2. ✅ Basic dashboard layout with navigation
3. ✅ Map component with basic functionality
4. ✅ WebSocket connection setup

### Phase 2: Real-time Features (Week 2-3)
1. ✅ Alerts panel with real-time updates
2. ✅ Map heatmap and zone overlays
3. ✅ AI insights widget
4. ✅ Basic actions panel

### Phase 3: Advanced Features (Week 3-4)
1. ✅ Reports management
2. ✅ Mobile responsive design
3. ✅ Performance optimizations
4. ✅ Error handling and edge cases

### Phase 4: Polish & Testing (Week 4)
1. ✅ UI/UX refinements
2. ✅ Comprehensive testing
3. ✅ Documentation
4. ✅ Demo preparation

---

This comprehensive guide provides everything your frontend team needs to build a professional, real-time crowd monitoring dashboard. Focus on getting the core functionality working first, then iterate on the UI/UX polish and advanced features.

Remember: **Real-time updates and clear visual hierarchy are the most important aspects** for operators making quick decisions during crowd management scenarios.
