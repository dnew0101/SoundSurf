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
| Ayush Rabadia | Backend Engineer | Express · WebSocket · Spotify API |
| Wai Lok Daniel Tam | Algorithm Engineer | WebAssembly · DSP · Beat Detection |
| David Newman | Frontend Engineer | React · R3F · Three.js · Zustand |

---

## How It Works

**1. Audio Analysis**
- User uploads an MP3/WAV or searches Spotify
- Spotify API returns tempo, energy, valence, danceability
- WASM processor runs FFT and beat detection on raw audio
- Beat grid (array of timestamps) is sent to the backend

**2. Track Generation**
- Backend converts BPM + beat grid into a track config
- Spline control points define where the road curves
- Obstacles are placed at beat-precise timestamps
- Speed ramps up over the song length
- Colors are chosen based on mood (valence) and energy

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
| Zustand | dotenv | Spotify Web API | Postman |
| Tailwind CSS | uuid | FFT (C) | npm |

---

## How to Run

### Prerequisites
- Node.js v20+
- npm v10+
- Spotify Developer account

### 1. Clone the repo
```bash
git clone https://github.com/dnew0101/SoundSurf.git
cd SoundSurf
```

### 2. Set up environment variables
```bash
cp server/.env.example server/.env
```
Fill in your Spotify credentials in `server/.env`:
