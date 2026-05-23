# SoundSurf 🎵

> Ride the music. Beat the track.

Hackathon Project — May 22–23, 2026

---

## What is SoundSurf?

SoundSurf is a music-driven 3D racing game inspired by AudioSurf. Drop in any song and the game analyzes the BPM, beat timing, energy, and mood to generate a unique race track. Curves, obstacles, speed, and colors all reflect the music in real time.

---

## Team

| Name | Role | Tools |
|---|---|---|
| Ayush Rabadia | Backend Engineer | Express · WebSocket · Jamendo API |
| Wai Lok Daniel Tam | Algorithm Engineer | WebAssembly · DSP · Beat Detection |
| David Newman | Frontend Engineer | React · R3F · Three.js · Zustand |

---

## How It Works

**1. Audio Analysis**
- User searches for a track or uploads an audio file
- Jamendo API returns full track MP3 URL, BPM, and genre tags — no OAuth needed
- WASM processor runs FFT and beat detection on the raw audio
- Beat grid (array of timestamps) is sent to the backend

**2. Track Generation**
- Backend converts BPM + beat grid into a track config
- Spline control points define where the road curves
- Obstacles are placed at beat-precise timestamps
- Speed ramps up over the song length
- Colors are chosen based on mood and energy

**3. 3D Rendering**
- React Three Fiber renders a procedural CatmullRom spline track
- Player car advances at BPM-driven speed
- Obstacles spawn on beats — dodge them to score
- Score and streak tracked in real time

---

## Tools & Technologies

| Frontend | Backend | Audio / DSP | Dev Tools |
|---|---|---|---|
| React + Vite | Node.js | Web Audio API | VS Code |
| React Three Fiber | Express.js | WebAssembly | Git + GitHub |
| Three.js | WebSocket (ws) | Emscripten | nodemon |
| Zustand | dotenv | Jamendo API | Postman |
| Tailwind CSS | uuid | FFT (C) | npm |

---

## How to Run

### Prerequisites
- Node.js v20+
- npm v10+
- Jamendo Developer account (free, no credit card)

### 1. Clone the repo
```bash
git clone https://github.com/dnew0101/SoundSurf.git
cd SoundSurf
```

### 2. Set up environment variables
```bash
cp server/.env.example server/.env
```
Fill in your Jamendo client ID in `server/.env`:
Get your free client ID at `developer.jamendo.com` — takes 2 minutes.

### 3. Start the backend
```bash
cd server
npm install
npm run dev
```
Server runs at `http://localhost:8000`
Health check: `http://localhost:8000/api/health`

### 4. Start the frontend
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`

### 5. Run backend tests
```bash
cd server
node tests/spotify.test.js
```

---

## Project Structure

| File | What it does |
|---|---|
| `server/index.js` | Entry point — starts Express, loads routes and WebSocket |
| `server/middleware/cors.js` | Blocks requests from unauthorized origins |
| `server/middleware/auth.js` | Validates Bearer tokens on protected routes |
| `server/routes/game.js` | Endpoints for sessions, track generation, scores |
| `server/routes/music.js` | Proxies all Jamendo API calls |
| `server/routes/scores.js` | Leaderboard read and write endpoints |
| `server/controllers/gameController.js` | Session management, scoring, difficulty curve |
| `server/controllers/trackController.js` | Converts BPM + beat grid into 3D track config |
| `server/controllers/jamendoController.js` | Track search, featured tracks, full MP3 URLs |
| `server/websocket/gameSocket.js` | Real-time score sync and beat events |
| `server/services/scoreService.js` | Reads and writes scores to JSON file |
| `server/tests/spotify.test.js` | Mock tests for all music API routes |
| `client/src/App.jsx` | Root React component, toggles Menu and GameCanvas |
| `client/src/components/GameCanvas.jsx` | R3F Canvas — 3D scene, camera, lighting |
| `client/src/components/RaceTrack.jsx` | Procedural spline geometry from track config |
| `client/src/components/PlayerCar.jsx` | Player vehicle moving along the spline |
| `client/src/components/BeatObstacle.jsx` | 3D obstacles spawned at beat timestamps |
| `client/src/hooks/useAudioAnalysis.js` | WASM bridge — returns BPM and beat grid |
| `client/src/hooks/useGameLoop.js` | R3F frame loop — moves player, checks collisions |
| `client/src/store/gameStore.js` | Zustand — score, speed, beat events, session state |
| `wasm/audio_processor.c` | FFT + onset detection compiled to WebAssembly |
| `wasm/beat_detector.c` | Rhythmic grid extraction from FFT output |
| `wasm/fft.c` | Fast Fourier Transform in C |

---

## API Endpoints

### Game `/api/game`
- `POST /start` — create a new game session
- `POST /generate-track` — convert BPM + beat grid to track config
- `POST /score` — submit final score
- `GET /session/:id` — get session state
- `DELETE /session/:id` — end a session

### Music `/api/music`
- `GET /search?q=` — search Jamendo for a track
- `GET /track/:trackId` — get a single track with full MP3 URL
- `GET /featured` — get top 20 popular tracks for the main menu

### Scores `/api/scores`
- `GET /leaderboard` — top 10 scores
- `GET /track/:trackId` — scores for a specific track
- `POST /` — save a new score

---

*SoundSurf · Hackathon 2026 · Ayush Rabadia · Wai Lok Daniel Tam · David Newman*
