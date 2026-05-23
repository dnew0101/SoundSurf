/**
 * @file gameSocket.js
 * @description WebSocket server for real-time game state sync.
 *              Clients connect and send events (score updates, beat hits,
 *              game over). The server broadcasts state back to all clients
 *              in the same session.
 *
 *              Message format (JSON):
 *                { type: string, sessionId: string, payload: object }
 *
 *              Supported types:
 *                "join"       - client joins a session room
 *                "score"      - client reports a score update
 *                "beat_hit"   - client hit a beat obstacle successfully
 *                "beat_miss"  - client missed a beat obstacle
 *                "game_over"  - game ended, final score in payload
 *
 * @author Ayush Rabadia
 * @version 5/22/2026
 */
 
const { WebSocketServer } = require("ws");


/**
 * Active session rooms.
 * Key: sessionId (string)
 * Value: Set of WebSocket clients in that session
 * @type {Map<string, Set<WebSocket>>}
 */
const rooms = new Map();

/**
 * Attach the WebSocket server to the existing HTTP server.
 * Call this once from index.js after creating the http.Server.
 *
 * @param {import('http').Server} httpServer - the Express HTTP server
 * @returns {void}
 */
const initGameSocket = (httpServer) => {
    const wss = new WebSocketServer({ server: httpServer });

    console.log("WebSocket server initialized");

    wss.on("connection", (ws) => {
        console.log("Client connected to WebSocket");

        // Track which session this socket belongs to for cleanup
        let currentSessionId = null;

        ws.on("message", (raw) => {
            let msg;
            try {
                msg = JSON.parse(raw);
            } catch {
                ws.send(JSON.stringify({ type: "error", payload: "Invalid JSON" }));
                return;
            }

            const { type, sessionId, payload } = msg;

            switch (type) {
                case "join":
                    handleJoin(ws, sessionId);
                    currentSessionId = sessionId;
                    break;

                case "score":
                    handleScore(ws, sessionId, payload);
                    break;

                case "beat_hit":
                    broadcast(sessionId, { type: "beat_hit", payload }, ws);
                    break;

                case "beat_miss":
                    broadcast(sessionId, { type: "beat_miss", payload }, ws);
                    break;

                case "game_over":
                    handleGameOver(ws, sessionId, payload);
                    break;

                default:
                    ws.send(JSON.stringify({ type: "error", payload: "Unknown message type" }));
            }
        });
        
        ws.on("close", () => {
            // Remove client from its session room on disconnect
            if (currentSessionId) {
                leaveRoom(ws, currentSessionId);
                console.log(`Client disconnected from session ${currentSessionId}`);
            }   
        });

        ws.on("error", (err) => {
            console.error("WebSocket error:", err.message);
        });
    });
};

/**
 * Add a client to a session room.
 * Creates the room if it doesn't exist yet.
 *
 * @param {WebSocket} ws        - the connecting client
 * @param {string}    sessionId - session to join
 * @returns {void}
 */
const handleJoin = (ws, sessionId) => {
    if (!sessionId) {
        ws.send(JSON.stringify({ type: "error", message: "sessionId required to join" }));
        return;
    }

    if (!rooms.has(sessionId)) {
        rooms.set(sessionId, new Set());
    }

    rooms.get(sessionId).add(ws);
    ws.send(JSON.stringify({ type: "joined", sessionId }));
    console.log(`Client joined session ${sessionId} (${rooms.get(sessionId).size} total)`);
};

/**
 * Handle a score update from a client.
 * Broadcasts the new score to all other clients in the session.
 *
 * @param {WebSocket} ws        - sending client
 * @param {string}    sessionId - session the score belongs to
 * @param {object}    payload   - { score, multiplier }
 * @returns {void}
 */
const handleScore = (ws, sessionId, payload) => {
    if (!payload?.score == null) {
        ws.send(JSON.stringify({ type: "error", payload: "Missing score in payload" }));
        return;
    }
    broadcast(sessionId, { type: "score_update", payload });
};

/**
 * Handle game over — broadcast final score and clean up the room.
 *
 * @param {WebSocket} ws        - sending client
 * @param {string}    sessionId - session that ended
 * @param {object}    payload   - { finalScore, playerName }
 * @returns {void}
 */
const handleGameOver = (ws, sessionId, payload) => {
    broadcast(sessionId, { type: "game_over", payload });
    // 
    rooms.delete(sessionId);
    console.log(`Session ${sessionId} ended and room cleared`);
};

/**
 * Broadcast a message to all clients in a session room.
 *
 * @param {string}        sessionId - target session
 * @param {object}        message   - object to JSON-serialize and send
 * @param {WebSocket|null} exclude  - client to skip (usually the sender); pass null to include all
 * @returns {void}
 */
const broadcast = (sessionId, message, exclude = null) => {
    const room = rooms.get(sessionId);
    if (!room) return;

    const serialized = JSON.stringify(message);
    room.forEach((client) => {
        if (client !== exclude && client.readyState === 1) {
            client.send(serialized);
        }
    });
};

/**
 * Remove a client from a session room.
 * Deletes the room if it becomes empty.
 *
 * @param {WebSocket} ws        - client to remove
 * @param {string}    sessionId - session to leave
 * @returns {void}
 */
const leaveRoom = (ws, sessionId) => {
    const room = rooms.get(sessionId);
    if (room) {
        room.delete(ws);
        if (room.size === 0) {
            rooms.delete(sessionId);
            console.log(`Room ${sessionId} deleted (empty)`);
        }
    }
};

module.exports = { initGameSocket };