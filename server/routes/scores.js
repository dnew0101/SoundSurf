/**
 * @file scores.js
 * @description Express router for leaderboard and score endpoints.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const express = require("express");
const router = express.Router();
const scoreService = require("../services/scoreService");

/**
 * Get the global leaderboard(top 10 scores).
 * 
 * @route GET /api/scores/leaderboard
 * @returns {object[]} sorted array of top scores with user info
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const scores = await scoreService.getLeaderboard();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});    

/**
 * Get all scores for a specific track.
 * @route GET /api/scores/track/:trackId
 * @param {string} trackId - track to filter scores by
 * @returns {object[]} scores for that track
 */
router.get("/track/:trackId", async (req, res) => {
    try {
        const scores = await scoreService.getScoresByTrack(req.params.trackId); 
        resByTrack(req.paramss.trackId);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Save a new score entry.
 * @route POST /api/scores
 * @body  {string} playerName - display name
 * @body  {number} score      - final score value
 * @body  {string} trackId    - track the score was set on
 * @returns {object} saved score entry with id
 */
router.post("/", async (req, res) => {
    try {
        const { playerName, score, trackId } = req.body;
        if (!playerName || score == null || !trackId) {
            return res.status(400).json({ error: "playerName, score, and trackId are required" });
        }
        const newScore = await scoreService.saveScore({ playerName, score, trackId });
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;