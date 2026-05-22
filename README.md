# SoundSurf
Hackathon Project that generates a racing game based on the audio file it's fed.

Frontend:
npm create vite@latest --> React frontend
R3F dependency --> 3D objects for gameplay

Backend:
npm install express --save --> Express Backend

WebDSP:
heavy functionally processing in WebAssembly.

Spotify API:
Calls the audio track, if possible, to parse in the WebDSP.

Goal is to have a game that parses audio data to pull BPM and rhythm, akin to AudioSurf, with a 3D gameplay race. backend should contain logic for game, frontend should contain the rendering logic and Canvas component for the racing.
