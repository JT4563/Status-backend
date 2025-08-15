# CrowdShield AI – Backend (JavaScript)

This is the **Node.js (JavaScript) backend** for CrowdShield AI. It is designed to work with a React/Tailwind frontend and a phone-based demo where a mobile device acts as a **CCTV-like camera**. You can run lightweight computer vision **on the phone** (e.g., via a web page using WebRTC + on-device model) and **POST detection metadata** to this backend—no IoT hardware required.

## 🎯 Project Goal (Clear Demo Scenario)
- **Problem:** Prevent crowd disasters by monitoring **density** and **movement** in real time.
- **Demo Setup (no IoT):** Use a **phone** mounted on a tripod; run a browser page or app that:
  - Captures the camera feed
  - Runs on-device detection (people count / movement) or estimates via JS
  - Sends **object detection summaries** (counts, bounding boxes) to backend using `POST /api/v1/cctv/objects`
  - Optionally sends **GPS pings** using `POST /api/v1/pings` (device location)
- **Backend tasks:**
  - Accept phone detections, raise **alerts** when thresholds breach
  - Maintain a recent **heatmap** of pings (Mongo TTL)
  - Serve **AI insights/predictions** (via ML REST or clever stubs)
  - Stream **live updates** via **Socket.IO** to the frontend
  - Allow staff to issue **actions** and ingest **reports**

## 🚀 Quick Start
```bash
cp .env.example .env
npm install
npm run seed
npm run dev
# API at http://localhost:8080
```

### Login (seeded)
```
email:    admin@crowdshield.ai
password: password123
```

## 🔌 Frontend → Backend Endpoints (copy exactly)
Use JWT from `/api/v1/auth/login` on protected routes.

- **Auth**
  - `POST /api/v1/auth/login` → `{ token, user }`
- **Map**
  - `GET /api/v1/map-data?eventId=EVENT_ID&bbox=minLng,minLat,maxLng,maxLat&windowSec=300`
- **Ping Ingestion (from phone)**
  - `POST /api/v1/pings` (auth required)
    ```json
    { "eventId":"EVENT_ID", "lat":12.97, "lng":77.60, "ts":"2025-08-15T08:00:00Z" }
    ```
- **CCTV-like Object Detections (from phone)**
  - `POST /api/v1/cctv/objects` (auth required)
    ```json
    {
      "eventId":"EVENT_ID",
      "cameraId":"phone-1",
      "ts":"2025-08-15T08:00:05Z",
      "objects":[
        {"label":"person","bbox":[10,20,120,240],"confidence":0.92}
      ]
    }
    ```
- **Alerts**
  - `GET /api/v1/alerts?eventId=EVENT_ID&status=active|resolved`
  - `PATCH /api/v1/alerts/:id/resolve`
- **AI / ML**
  - `GET /api/v1/ai-insights?eventId=EVENT_ID`
  - `GET /api/v1/ai-predictions?eventId=EVENT_ID&horizonMinutes=5`
- **Actions**
  - `POST /api/v1/actions`
    ```json
    { "eventId":"EVENT_ID","zoneId":"ZONE_ID","command":"Open Gate 3","notes":"Redirect flow" }
    ```
- **Reports (anonymous allowed)**
  - `POST /api/v1/reports`
    ```json
    { "eventId":"EVENT_ID","zoneId":"ZONE_ID","type":"hazard","message":"Gate blocked" }
    ```
  - `GET /api/v1/reports?eventId=EVENT_ID`
- **System Health**
  - `GET /api/v1/system-health`

**WebSocket namespace:** `/realtime?eventId=EVENT_ID` with `auth.token` (JWT).  
**Events emitted:** `map:update`, `alert:new`, `alert:updated`, `report:new`, `action:created`, `insight:update`, `prediction:update`.

## 📱 How to send detections from the phone (demo idea)
1. Build a small **web page** that uses `getUserMedia` to access camera.
2. Run an in-browser model (e.g., TensorFlow.js) **or** simply count motion/edges for a basic density proxy.
3. Send periodic summaries (e.g., people count) to:
   - `POST /api/v1/cctv/objects` with `{ objects:[...] }`
4. If you want a moving heatmap, also POST GPS to `/api/v1/pings`.

## 🧠 ML Service (optional)
Set `ML_BASE` in `.env` to a Python microservice. If ML is down, backend will return last cached data or a `mlStatus: 'degraded'|'down'` flag so UI stays stable.

## 🗂️ Project Structure
See folders for `models`, `controllers`, `routes`, `services`, and `middleware`. `LocationPing` has a TTL index of **15 minutes** to keep only recent data.

## 🔒 Security
- JWT on protected routes
- Rate limits for login, reports, actions
- CORS restricted to your frontend origin
- Helmet + compression + logging

## 🧪 Seed Data
Run `npm run seed` to create:
- Admin user: `admin@crowdshield.ai / password123`
- Demo Event & Zone (IDs printed in console)

---

## ✅ Notes
- This repo is **backend only**.  
- The endpoints and payloads are **exactly** what the frontend prompt expects.  
- You can mount legacy non-versioned routes (`/api/...`) are already provided for compatibility.
