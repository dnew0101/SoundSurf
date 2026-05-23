/**
 * @file game.js
 * @description Express router for game-related API endpoints.
 *              Handles session creation, track generation, and scoring.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const trackController = require("../controllers/trackController");

/**
 * Start a new game session.
 * @route POST /api/game/start
 * @body  {string} userId - unique identifier for the player
 * @returns {object} sessionId, startedAt
 */
router.post("/start", gameController.startSession);

/**
 * Generate a track configuration from audio analysis data.
 * Called after the WASM processor returns BPM + beat grid.
 * @route POST /api/game/generate-track
 * @body  {number}   bpm       - beats per minute from WASM
 * @body  {number[]} beatGrid  - array of beat timestamps (seconds)
 * @body  {number}   energy    - Spotify energy value 0–1
 * @body  {number}   valence   - Spotify valence value 0–1
 * @returns {object} track config (spline points, obstacle schedule, colors)
 */
router.post("/generate-track", trackController.generateTrack);

/**
 * Submit a score at the end of a game session.
 * @route POST /api/game/score
 * @body  {string} sessionId - session returned from /start
 * @body  {number} score     - final player score
 * @body  {string} trackId   - identifier of the track played
 * @returns {object} saved score entry
 */
router.post("/score", gameController.submitScore);

/**
 * Get the current state of an active game session.
 * @route GET /api/game/session/:sessionId
 * @param {string} sessionId - session to look up
 * @returns {object} session state
 */
router.get("/session/:sessionId", gameController.getSession);

/**
 * End and clean up a game session.
 * @route DELETE /api/game/session/:sessionId
 * @param {string} sessionId - session to end
 * @returns {object} confirmation
 */
router.delete("/session/:sessionId", gameController.endSession);
module.exports = router;