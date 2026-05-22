# SoundSurf
Key files to build first (in order):

1. wasm/audio_processor.c + Makefile — compile with emcc to get audio_processor.wasm into client/public/wasm/.
  This is your critical path; nothing else can be tested end-to-end without it.

2.server/index.js + routes/spotify.js — stand up Express, add the Spotify OAuth token exchange proxy so the client never exposes credentials. Spotify's /audio-features endpoint gives you tempo, energy, valence, time_signature for free — use those as fallback when the WASM analysis isn't done yet.

3. client/src/hooks/useAudioAnalysis.js — the WASM loader. Instantiate via WebAssembly.instantiateStreaming, expose a processAudio(audioBuffer) → { bpm, beatGrid } function that R3F hooks can call.

4. client/src/components/GameCanvas.jsx — R3F <Canvas> with a <PerspectiveCamera>, basic lighting, and a stub <RaceTrack>. Get something rendering before wiring audio.

5. server/controllers/trackController.js — the BPM-to-geometry transformer. Takes { bpm, beatGrid, energy, valence } and returns spline control points + an obstacle schedule. This is where AudioSurf-style track shaping lives.
