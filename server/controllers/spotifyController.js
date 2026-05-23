/**
 * @file spotifyController.js
 * @description Spotify API proxy controller.
 *              Keeps client credentials server-side and handles
 *              token exchange, track search, and audio feature fetching.
 *
 *              Requires in .env:
 *                SPOTIFY_CLIENT_ID
 *                SPOTIFY_CLIENT_SECRET
 *                SPOTIFY_REDIRECT_URI
 *
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

/**
 * Build the Base64-encoded Basic auth header required by Spotify.
 * @returns {string} "Basic <base64(clientId:clientSecret)>"
 */
const getBasicAuthHeader = () => {
    const credentials = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
};


/**
 * Exchange a Spotify OAuth authorization code for access + refresh tokens.
 *
 * @param {import('express').Request}  req - body: { code, redirectUri }
 * @param {import('express').Response} res
 * @returns {object} { accessToken, refreshToken, expiresIn }
 */
const getToken = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
 
    if (!code || !redirectUri) {
      return res.status(400).json({ error: "code and redirectUri are required" });
    }
 
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
            "Authorization": getBasicAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error_description || "Failed to get token" });
    }

    res.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    });
  } catch (error) {
    console.error("Error in getToken:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Refresh an expired Spotify access token using a refresh token.
 *
 * @param {import('express').Request}  req - body: { refreshToken }
 * @param {import('express').Response} res
 * @returns {object} { accessToken, expiresIn }
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
 
    if (!token) {
      return res.status(400).json({ error: "refreshToken is required" });
    }
 
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token,
    });
 
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: getBasicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error_description });
    }
 
    res.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Search Spotify for a track by name/artist.
 *
 * @param {import('express').Request}  req - query: { q, limit }
 * @param {import('express').Response} res
 * @returns {object[]} simplified track results
 */
const searchTracks = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        const accessToken = req.headers["authorization"]?.split(" ")[1];

        if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });
        if (!accessToken) return res.status(401).json({ error: "Missing Spotify access token" });

        const url = `${SPOTIFY_API_BASE_URL}/search?type=track&q=${encodeURIComponent(q)}&limit=${limit}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error.message || "Spotify API error" });
        }

        // Return only the fields the game needs
        const tracks = data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0]?.name,
            previewUrl: track.preview_url,
            albumArt: track.album.images[0]?.url,
            durationMs: track.duration_ms,
        }));

        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Fetch Spotify audio features for a track.
 * Returns tempo, energy, valence, danceability, and time signature —
 * all used by trackController to generate the race track.
 *
 * @param {import('express').Request}  req - params: { trackId }
 * @param {import('express').Response} res
 * @returns {object} audio features
 */
const getAudioFeatures = async (req, res) => {
  try {
    const { trackId } = req.params;
    const accessToken = req.headers["authorization"]?.split(" ")[1];
 
    if (!accessToken) return res.status(401).json({ error: "Missing Spotify access token" });
 
    const url = `${SPOTIFY_API_BASE}/audio-features/${trackId}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message });
    }
 
    // Return only what trackController needs
    res.json({
      trackId: data.id,
      tempo: data.tempo,           // BPM
      energy: data.energy,         // 0–1 intensity
      valence: data.valence,       // 0–1 sad → happy
      danceability: data.danceability,
      timeSignature: data.time_signature,
      durationMs: data.duration_ms,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
/**
 * Get the 30-second preview MP3 URL for a Spotify track.
 * This URL is what gets passed to the WASM audio processor.
 *
 * @param {import('express').Request}  req - params: { trackId }
 * @param {import('express').Response} res
 * @returns {object} { previewUrl }
 */
const getPreviewUrl = async (req, res) => {
  try {
    const { trackId } = req.params;
    const accessToken = req.headers["authorization"]?.split(" ")[1];
 
    if (!accessToken) return res.status(401).json({ error: "Missing Spotify access token" });
 
    const url = `${SPOTIFY_API_BASE_URL}/tracks/${trackId}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message });
    }
 
    if (!data.preview_url) {
      return res.status(404).json({ error: "No preview available for this track" });
    }
 
    res.json({ previewUrl: data.preview_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
module.exports = {
  getToken,
  refreshToken,
  searchTracks,
  getAudioFeatures,
  getPreviewUrl,
};