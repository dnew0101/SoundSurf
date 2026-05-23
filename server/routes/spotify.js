/**
 * @file spotify.js
 * @description Express router for Spotify API proxy endpoints.
 *              The client never touches Spotify directly — all calls
 *              go through here so credentials stay server-side.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const express = require("express");
const router = express.Router();
const spotifyController = require("../controllers/spotifyController");

/**
 * Exchange a Spotify authorization code for an access token.
 * @route POST /api/spotify/token
 * @body  {string} code         - OAuth authorization code from Spotify
 * @body  {string} redirectUri  - must match the registered redirect URI
 * @returns {object} accessToken, refreshToken, expiresIn
 */
router.post("/token", spotifyController.getAccessToken);

/**
 * Refresh an expired Spotify access token.
 * @route POST /api/spotify/refresh
 * @body  {string} refreshToken - token received from /token
 * @returns {object} accessToken, expiresIn
 */
router.post("/refresh", spotifyController.refreshAccessToken);

/**
 * Search for a track on Spotify.
 * @route GET /api/spotify/search
 * @query {string} q     - search query (track name / artist)
 * @query {number} limit - max results to return (default 10)
 * @returns {object[]} array of track results
 */

router.get("/search", spotifyController.searchTracks);

/**
 * Get audio features for a Spotify track (tempo, energy, valence, etc.)
 * This is the main data source for track generation.
 * @route GET /api/spotify/features/:trackId
 * @param {string} trackId - Spotify track ID
 * @returns {object} audio features including tempo, energy, valence
 */
router.get("/features/:trackId", spotifyController.getTrackFeatures);

/**
 * Get the 30-second preview URL for a Spotify track.
 * @route GET /api/spotify/preview/:trackId
 * @param {string} trackId - Spotify track ID
 * @returns {object} previewUrl
 */
router.get("/preview/:trackId", spotifyController.getTrackPreview);

module.exports = router;