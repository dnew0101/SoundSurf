/**
 * @file index.js
 * @description Entry point for the SoundSurf Express backend server.
 *              Sets up middleware, routes, and the WebSocket server.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const corsMiddleware = require("./middleware/cors");
const gameRoutes = require("./routes/game");
const spotifyRoutes = require("./routes/spotify");
const scoresRoutes = require("./routes/scores");
const { initGameSocket } = require("./websocket/gameSocket");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ─── Middleware ─── */
app.use(corsMiddleware);
app.use(express.json());

/* ─── API Routes */
app.use("/api/game", gameRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/scores", scoresRoutes);

/**
 * Health-check endpoint so the client can verify the server is alive.
 * @route GET /api/health
 * @returns {object} 200 - status ok
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ─── Start HTTP server and attach WebSocket server */
const server = http.createServer(app);
initGameSocket(server);

server.listen(PORT, () => {
  console.log(`SoundSurf server running on http://localhost:${PORT}`);
});