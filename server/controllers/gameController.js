/**
 * @file gameController.js
 * @description Core game logic controller.
 *              Manages game sessions, scoring, and difficulty curves.
 *              A "session" is created when a player starts a game and
 *              destroyed when the song ends or the player quits.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const { v4: uuidv4 } = require("uuid");

/**
 * In-memory session store.
 * Key: sessionId (string)
 * Value: session object
 * @type {Map<string, object>}
 */
const sessions = new Map();

/**
 * Create and store a new game session.
 *
 * @param {import('express').Request}  req - body: { userId }
 * @param {import('express').Response} res
 * @returns {object} { sessionId, userId, startedAt, score, status }
 */
const startSession = (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const sessionId = uuidv4();
    const session = {
      sessionId,
      userId,
      startedAt: new Date().toISOString(),
      score: 0,
      multiplier: 1,
      status: "active", // active | finished | abandoned
    };

    sessions.set(sessionId, session);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve the current state of a game session.
 *
 * @param {import('express').Request}  req - params: { sessionId }
 * @param {import('express').Response} res
 * @returns {object} session state or 404
 */
const getSession = (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(session);
};

/**
 * Submit the final score for a session and mark it finished.
 *
 * @param {import('express').Request}  req - body: { sessionId, score, trackId }
 * @param {import('express').Response} res
 * @returns {object} updated session with final score
 */
const submitScore = (req, res) => {
  try {
    const { sessionId, score, trackId } = req.body;

    if (!sessionId || score == null) {
      return res.status(400).json({ error: "sessionId and score are required" });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.score = score;
    session.trackId = trackId;
    session.status = "finished";
    session.finishedAt = new Date().toISOString();

    sessions.set(sessionId, session);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * End and remove a session from memory.
 *
 * @param {import('express').Request}  req - params: { sessionId }
 * @param {import('express').Response} res
 * @returns {object} confirmation message
 */
const endSession = (req, res) => {
  const { sessionId } = req.params;
  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: "Session not found" });
  }
  sessions.delete(sessionId);
  res.json({ message: `Session ${sessionId} ended` });
};

/**
 * Calculate the score multiplier based on how far into the song
 * the player is. Gets harder (faster, more obstacles) as energy builds.
 *
 * @param {number} progress - 0 to 1, how far through the track
 * @param {number} energy   - Spotify energy value 0–1
 * @returns {number} multiplier between 1 and 3
 */
const getDifficultyMultiplier = (progress, energy) => {
  const base = 1 + progress * 2;       // ramps from 1x to 3x over the song
  const energyBoost = energy * 0.5;    // high energy songs are harder
  return parseFloat((base + energyBoost).toFixed(2));
};

module.exports = {
  startSession,
  getSession,
  submitScore,
  endSession,
  getDifficultyMultiplier,
};