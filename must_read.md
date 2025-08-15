# Full, deep explanation — what this project *really* is and exactly how Frontend, Backend and ML connect

I thought long and hard about this so your whole team (devs, ML folks, demoers, and judges) can open one doc and instantly understand *end-to-end* how CrowdShield AI works, what each layer is responsible for, and the exact messages and contracts they use to talk to one another. I’ll start with a very thorough technical walk-through, then finish with a short plain-language summary suitable to paste into Notion for every team member.

---

# 1 — Executive summary (one-sentence)

**CrowdShield AI** is a real-time crowd-safety platform: a phone (acting as a camera) and staff devices send lightweight telemetry and detection summaries to a Node.js backend; the backend stores short-lived geospatial pings, calls an ML microservice to compute risk & short-term predictions, and pushes live updates (heatmap, alerts, AI insights) to a React frontend via Socket.IO — operators then take actions (open gates, send messages) which the backend logs and broadcasts.

---

# 2 — High-level architecture (ASCII diagram)

```
[Phone Camera Web App]  <--HTTPS-->  [Backend API (Node/Express)]
      |  (pings,cctv objects)               |                 ^
      |                                     |                 |
      |                                     v                 |
      +--- websocket (optional) --------> Socket.IO           |
                                              |               |
                                              v               |
                                         [Frontend UI (React)]|
                                              ^               |
                ML REST (HTTP) <--- axios --- |               |
                                      [ML Microservice (FastAPI/Python)]
```

Key runtime channels:

* **HTTP REST**: for requests/responses (map data, auth, AI requests, actions, reports)
* **Socket.IO (WebSockets)**: for real-time server → client pushes (`map:update`, `alert:new`, etc.)
* **ML REST**: backend → ML microservice (`/insights`, `/predictions`)
* **Auth**: JWT tokens for protected endpoints and socket handshake

---

# 3 — Core components & responsibilities

### Frontend (React + Tailwind)

* Authentication UI (login / token handling)
* Full-screen Interactive Map (react-leaflet / Mapbox) consuming `/api/v1/map-data`
* Live Alerts Panel (receives `alert:new`, `alert:updated`)
* AI Insights Widget (calls `/api/v1/ai-insights` and receives `insight:update`)
* Actions UI: send operator commands (`POST /api/v1/actions`)
* Reports UI: anonymous or staff reports (`POST /api/v1/reports`)
* Socket client: subscribes to `event:${eventId}` room and receives pushes

### Backend (Node.js + Express + Socket.IO + MongoDB)

* Auth (JWT), RBAC (`admin`, `staff`)
* Ingest endpoints for:

  * Location pings: `POST /api/v1/pings`
  * Phone-camera detections (CCTV-like): `POST /api/v1/cctv/objects`
  * Reports: `POST /api/v1/reports`
* Map data endpoints: `GET /api/v1/map-data` — computes points & density cells
* Alerts subsystem: create/resolve alerts, push `alert:new`
* Actions subsystem: record operator commands, broadcast `action:created`, optionally trigger SMS/WhatsApp
* ML client: call ML microservice (`/insights`, `/predictions`) with proper timeout (e.g., 1.5s) and caching/fallback
* Socket server: namespace `/realtime` + rooms `event:${eventId}`; uses Redis adapter if scaling
* TTL retention: `location_pings` TTL index (15 minutes)

### ML Microservice (FastAPI Python)

* Endpoints:

  * `POST /insights` — compute current riskScore & recommendation from recent pings + zone stats
  * `POST /predictions` — forecast risk per zone over a short horizon
  * `GET /health` — ML availability
* Loads joblib/pickled models, exposes predictions in JSON
* Provides `mlStatus` semantics: `ok` | `degraded` | `down`
* Training utilities and developer docs included

---

# 4 — Detailed data flows (step-by-step)

Below are the most important runtime scenarios you’ll demo / rely on. Each step includes the exact endpoints, payload shapes and messages.

---

## A) Phone sends detection summary (phone-as-CCTV)

**When:** phone running a camera web page counts people or runs bounding-box detection and wants to tell the backend.

1. Phone obtains JWT by login (staff account) OR phone uses a pre-provisioned device token.
2. POST to backend:

   * `POST /api/v1/cctv/objects` (Auth required)
   * Body:

     ```json
     {
       "eventId":"<EVENT_ID>",
       "cameraId":"phone-01",
       "ts":"2025-08-15T12:00:05Z",
       "objects":[
         {"label":"person","bbox":[x,y,w,h],"confidence":0.92},
         ...
       ]
     }
     ```
3. Backend:

   * Stores the record (optionally in `Camera` + `objects` collection) OR just processes as event input.
   * Applies simple rules (e.g., `if objects.length > threshold -> create Alert`).
   * If alert created, store in `alerts` collection and emit:

     * WebSocket: `alert:new` payload:

       ```json
       { "id": "6123...", "type":"overcrowd", "zoneId": "Z1", "message":"High density", "severity":"med", "createdAt":"..." }
       ```
   * Return `{ ok: true }` to phone.

**Frontend effect:** Alerts panel receives `alert:new` and highlights zone on map.

---

## B) Phone sends geolocation pings (heatmap)

**When:** phone periodically pings its GPS so map shows people distribution.

1. `POST /api/v1/pings` (Auth required)

   ```json
   { "eventId": "E1", "lat": 12.97, "lng": 77.60, "ts": "2025-08-15T12:00:02Z" }
   ```
2. Backend:

   * Insert into `location_pings` with `loc: { type: 'Point', coordinates: [lng, lat] }`
   * TTL index auto-expires after 15m
   * Emit `map:update` to `event:E1` with incremental points so the map can animate:

     ```json
     { "points":[{"lat":12.97,"lng":77.60,"ts":"..."}], "density":[], "updatedAt":"..." }
     ```
3. Frontend:

   * Receives `map:update`; appends new points to local heatmap layer and recomputes gradient.

**Notes:** For efficiency, backend can aggregate pings into grid cells server-side and send density buckets to minimize data sent over socket.

---

## C) Frontend requests AI insight (explicit or periodic)

**When:** UI wants a top-level risk assessment and recommended action.

1. Frontend calls:

   * `GET /api/v1/ai-insights?eventId=E1`
2. Backend:

   * Collects features: recent pings, zoneStats (density & flow), optionally CCTV aggregations.
   * Calls ML: `POST ${ML_BASE}/insights` with:

     ```json
     { "eventId":"E1", "recentPings":[...], "zoneStats":[{"zoneId":"Z1","density":10,"flow":0.2}, ...] }
     ```
   * Timeout: 1.5s; if ML fails -> return last cached insight + include `mlStatus: 'degraded'` or return fallback.
   * Broadcast `insight:update` event via socket:

     ```json
     { "riskScore":0.78, "recommendation":"Open Gate 3; redirect flow", "confidence":0.82, "factors":[...], "generatedAt":"..." }
     ```
   * Respond to calling frontend with same JSON.
3. Frontend:

   * Shows AI Insights Widget (risk meter, recommended actions).
   * If `mlStatus != 'ok'` show degraded badge.

---

## D) Frontend asks for short-term predictions (per-zone)

* `GET /api/v1/ai-predictions?eventId=E1&horizonMinutes=5`
* Backend calls ML `/predictions`, emits `prediction:update`, frontend updates map overlays (color zones by predicted risk).

---

## E) Operator takes action

1. Operator clicks "Open Gate 3" in UI.
2. Frontend POSTs:

   * `POST /api/v1/actions` (Auth)

   ```json
   { "eventId":"E1", "zoneId":"Z3", "command":"Open Gate 3", "notes":"redirect flow" }
   ```
3. Backend:

   * Persist `Action` document.
   * Emit `action:created` to event room.
   * If action requires broadcast, call Twilio/WhatsApp (stubbed if not configured).
4. Frontend:

   * Receives confirmation and updates UI.

---

## F) Reports (attendee or staff)

* Public `POST /api/v1/reports` with optional `Idempotency-Key` header to avoid duplicates.
* Backend stores reports, emits `report:new` to staff clients.

---

# 5 — Exact API contract & sample payloads (copyable)

> **Auth**

* `POST /api/v1/auth/login`
  Req: `{ "email","password" }`
  Res: `{ "token": "<JWT>", "user": { "id","name","role"} }`

> **Map**

* `GET /api/v1/map-data?eventId=E1&bbox=minLng,minLat,maxLng,maxLat&windowSec=300`
  Res:

  ```json
  { "points":[{"lat":12.97,"lng":77.60,"ts":"..."}, ...], "density":[{"cell":[12.97,77.60],"count":10}], "updatedAt":"..." }
  ```

> **Pings (device)**

* `POST /api/v1/pings` (Auth)
  `{ "eventId","lat", "lng", "ts?" }`
  Res: `{ "id": "<pingId>" }`

> **CCTV objects (phone)**

* `POST /api/v1/cctv/objects` (Auth)
  Body: earlier example. Response `{ "ok": true }`

> **Alerts**

* `GET /api/v1/alerts?eventId=E1&status=active` → `{ "items":[ ... ] }`
* `PATCH /api/v1/alerts/:id/resolve` → `{ "ok": true }`

> **AI / ML**

* `GET /api/v1/ai-insights?eventId=E1` → returns insight JSON
* `GET /api/v1/ai-predictions?eventId=E1&horizonMinutes=5` → returns prediction JSON

> **Actions**

* `POST /api/v1/actions` (Auth) → returns created action object (201)

> **Reports**

* `POST /api/v1/reports` (Idempotency-Key optional) → `{ "id","status":"received" }`

> **Health**

* `GET /api/v1/system-health` → returns `api, db, ml, socket, dependencies, time`

> **WebSocket Namespace**: `/realtime?eventId=E1` (JWT in handshake)
> Server emits channels:

* `map:update`
* `alert:new`
* `alert:updated`
* `report:new`
* `action:created`
* `insight:update`
* `prediction:update`

---

# 6 — Data model summary (collections & key fields)

* **Users**: `{ _id, name, email, passwordHash, role, orgId }`
* **Events**: `{ _id, name, bounds: Polygon, startAt, endAt }`
* **Zones**: `{ _id, eventId, name, polygon }`
* **LocationPing**: `{ eventId, source, loc: Point [lng,lat], createdAt }` (TTL 900s)
* **Alert**: `{ eventId, zoneId?, type, message, severity, status, source, createdAt, resolvedAt }`
* **Action**: `{ eventId, zoneId?, command, notes, createdBy, createdAt, deliveredVia }`
* **Report**: `{ eventId, zoneId?, type, message, attachments, idempotencyKey, createdAt }`
* **AiInsight / AiPrediction**: caches for ML outputs `{ eventId, riskScore, recommendation, ... }`

---

# 7 — ML integration details — contract & expectations (for ML devs)

**Required ML endpoints (HTTP)**:

1. `POST /insights`

   * Req:

     ```json
     { "eventId":"E1", "recentPings":[ {"lat":..,"lng":..,"ts":"..."} ], "zoneStats":[{"zoneId":"Z1","density":10,"flow":0.2}] }
     ```
   * Res:

     ```json
     { "riskScore": 0.73, "recommendation": "Open Gate 3", "confidence": 0.82, "factors": [{"name":"avg_density","weight":0.4}], "generatedAt":"..." }
     ```
2. `POST /predictions`

   * Req:

     ```json
     { "eventId":"E1", "horizonMinutes":5, "features": { "zones": [{"zoneId":"Z1","density":10}, ...] } }
     ```
   * Res:

     ```json
     { "horizonMinutes":5, "predictions":[ {"zoneId":"Z1","risk":0.6,"confidence":0.7} ], "generatedAt":"..." }
     ```

**Performance & behavior**:

* Target response latency: **<= 1.5 seconds** for `/insights`. If longer, backend will treat ML as degraded.
* Provide `GET /health` to let backend know ML is reachable.
* Return consistent JSON shapes; use float values in 0..1 for probabilities.

**Versioning**:

* ML should include model metadata (version, training date) in responses or as separate metadata endpoint so backend can surface model version to admin UI.

**Explainability (optional but valuable)**:

* If possible, expose an `/explain` endpoint returning SHAP-like contributions for the top features — the frontend “Explain Prediction” modal will display this.

---

# 8 — Resilience & fallback design (important for demos & judges)

* **Timeouts**: Backend calls ML with a configurable timeout (1.5s), then:

  * If success -> pass through and broadcast
  * If fail -> return last cached insight and include `mlStatus: 'degraded'` and `confidence: null` (or lower)
* **Cache**: Store last successful insight/prediction per `eventId` (Redis or Mongo).
* **Graceful UI**: Frontend must handle `mlStatus` and show clear indicator (green/orange/red badge).
* **Idempotency**: Reports support `Idempotency-Key` header to protect from accidental multi-submissions.
* **Rate limiting**: Protect public report route and login from abuse.

---

# 9 — Developer workflow & responsibilities (who does what)

### Frontend devs

* Implement UI components (Map, Alerts, AI-widget, Actions) and wire to the **exact endpoints** listed above.
* Implement Socket.IO client: authenticate with JWT at handshake.
* Show `mlStatus` in UI and degrade visuals when ML is degraded.

### Backend devs

* Implement API middleware, socket broadcasts, TTL pings, ML client with timeouts and cache.
* Provide seed script for demo event + admin user (we already have those in the repo).
* Provide .env.example and OpenAPI docs so frontend types can be auto-generated.

### ML engineers

* Provide `/insights` and `/predictions`, with robust, repeatable training scripts.
* Keep models as joblib or serialized artifacts and include model version metadata.
* Provide `GET /health`.
* Optionally add `/explain` for interpretability.

### Demo operator / judge explanation role

* Run backend, run ML service, seed data, open frontend, mount phone on tripod and start phone web page; login as staff and showcase live alert creation from phone detections.

---

# 10 — Step-by-step demo checklist (for hackathon)

1. Start MongoDB (local/docker).
2. Start backend: `npm run dev` (or container).
3. Start ML microservice: train models and `uvicorn` as in ML ZIP.
4. Run seed script: `npm run seed` — note `eventId`, `zoneId`, admin creds.
5. Start frontend (dev server).
6. Phone: open demo page (getUserMedia) that posts detections to `/api/v1/cctv/objects` (use admin token) and pings to `/api/v1/pings`.
7. Watch frontend map update + AI widget. Trigger an overcrowd by holding phone close or producing more detections; an `alert:new` should appear and AI may recommend action.
8. Perform `POST /api/v1/actions` from UI to show action broadcast.

---

# 11 — Security & privacy (short but crucial)

* Use HTTPS in production; store JWT secrets securely.
* Avoid storing PII in pings — store device id or anonymous id.
* Retention: `location_pings` auto-deletes after 15m; archival is optional.
* Rate-limit public endpoints and require staff accounts for device ingestion (or scoped device tokens).

---

# 12 — Testing & observability

* Unit tests for map aggregation, ML client fallback, socket emissions.
* e2e tests: simulate posting pings/cctv entries and assert socket emits.
* Expose `/metrics` for latency and error counts; log model versions and request IDs.

---

# 13 — Short plain-language summary for Notion (copy-paste)

**Project:** CrowdShield AI — real-time crowd-safety monitoring and prevention.

**What it does:**
A phone acts as a low-cost camera and sends short detection summaries and GPS pings to our Node backend. The backend combines these with geospatial pings to build a live heatmap and queries an ML microservice that calculates a risk score and short-term predictions for each zone. Everything (heatmap updates, alerts, AI recommendations) is pushed in real-time to the operator UI (React), where staff can take actions (open gates, dispatch help). All parts are connected with clear REST endpoints and WebSocket events so team members can work independently and plug their work together cleanly.

**How Frontend, Backend, ML fit together:**

* **Frontend (React)** shows the map, alerts, and AI widget. It requests map data from the **Backend** and listens for socket events. It sends staff actions back to the backend.
* **Backend (Node)** stores short-lived pings, runs aggregation for density, calls the ML microservice to get `insights` and `predictions`, raises alerts if thresholds are met, and broadcasts everything to the frontend. It is the single trusted bridge between UI and ML.
* **ML (Python/FastAPI)** is a separate microservice that receives event features (pings, zone stats) and returns risk scores and predictions. It is design/replaceable by ML engineers; the backend calls it via HTTP and falls back gracefully if it’s unavailable.

**Key endpoints & events (for developers):**

* `POST /api/v1/cctv/objects` (phone → backend)
* `POST /api/v1/pings` (phone → backend)
* `GET /api/v1/map-data` (frontend → backend)
* `GET /api/v1/ai-insights` & `/api/v1/ai-predictions` (backend → ML)
* Socket.IO `/realtime?eventId` room emits `map:update`, `alert:new`, `insight:update`, etc.

---

# 14 — Final checklist / next actions (team tasks)

* Frontend: implement map + socket client + UI components and wire to exact endpoints above.
* Backend: finalize API handlers, socket server, TTL indexes and ML client with 1.5s timeout + caching.
* ML: train production model or use starter models in the ML ZIP; add `/health` and model metadata.
* Integration test: simulate phone posting detections and ensure `alert:new` arrives and frontend displays recommendation.

---

If you want, I’ll now:

* Produce a **one-page Notion-friendly summary** (copy-ready) with the plain-language section only.
* Or produce **detailed OpenAPI** with all endpoints + sample schemas so frontend can auto-generate TypeScript types.
* Or create the **phone demo HTML/JS** that posts detections to the backend (so demo team knows exactly how to demonstrate the phone-as-camera approach).

Which one should I do next?
