/**
 * @file trackController.js
 * @description Converts audio analysis data (BPM + beat grid from Tam's WASM)
 *              into a deterministic track configuration for David's R3F frontend.
 *
 *              The track config tells the frontend:
 *                - splinePoints: 3D control points for the race track spline
 *                - obstacleSchedule: when and where obstacles appear (keyed to beats)
 *                - speedCurve: how fast the player moves at each point
 *                - colorPalette: visual theme based on Spotify energy/valence
 *
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

 
/**
 * Generate a complete track configuration from audio analysis data.
 * This is the main bridge between the audio layer and the game renderer.
 *
 * @param {import('express').Request}  req
 *   body: { bpm, beatGrid, energy, valence }
 * @param {import('express').Response} res
 * @returns {object} trackConfig
 */
const generateTrackConfig = (req, res) => {
    try {
        const { bpm, beatGrid, energy = 0.5, valence = 0.5 } = req.body;

        if (!bpm || !beatGrid || !Array.isArray(beatGrid)) {
            return res.status(400).json({ error: "Invalid input: bpm and beatGrid are required." });
        }

        const splinePoints = buildSplinePoints(beatGrid, energy);
        const obstacleSchedule = buildObstacleSchedule(beatGrid, bpm, energy);
        const speedCurve = buildSpeedCurve(bpm, energy, beatGrid.length);
        const colorPalette = buildColorPalette(energy, valence);

        res.json({
      bpm,
      duration: beatGrid[beatGrid.length - 1] ?? 0,
      splinePoints,
      obstacleSchedule,
      speedCurve,
      colorPalette,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Build 3D spline control points from the beat grid.
 * Each beat becomes a waypoint — high energy beats cause bigger curves.
 *
 * @param {number[]} beatGrid - array of beat timestamps in seconds
 * @param {number}   energy   - Spotify energy 0–1 (controls curve intensity)
 * @returns {{ x: number, y: number, z: number }[]} control points
 */
const buildSplinePoints = (beatGrid, energy) => {
    return beatGrid.map((timestamp, i) => {
        // Zig-zag left/right based on beat index and energy level
        const direction = i % 2 === 0 ? 1 : -1;
        const intensity = energy * 8;

        return {
            x: side * curveAmount * Math.sin(i * 0.5),
            y: Math.sin(i*0.3) * energy * 3, // slight vertical waves
            z: -(i * 10), // advance forward along z-axis
        };
    });
};

/**
 * Build the obstacle schedule — determines what spawns, when, and where.
 * Obstacles appear on strong beats; density scales with energy.
 *
 * @param {number[]} beatGrid - beat timestamps in seconds
 * @param {number}   bpm      - beats per minute
 * @param {number}   energy   - Spotify energy 0–1
 * @returns {{ timestamp: number, type: string, lane: number }[]}
 */
const buildObstacleSchedule = (beatGrid, bpm, energy) => {
      // Spawn obstacles on every beat when energy > 0.7, every other beat otherwise
  const spawnInterval = energy > 0.7 ? 1 : 2;

    return beatGrid
        .filter((_, i) => i % spawnInterval === 0)
        .map((timestamp, i) => ({
            timestamp,
            type: getObstacleType(energy),
            lane: Math.floor(Math.random() * 3), // random lane (-1, 0, or 1)
        }));
};

/**
 * Determine obstacle type based on track energy.
 * High energy songs get more complex obstacles.
 *
 * @param {number} energy - Spotify energy 0–1
 * @returns {string} obstacle type identifier
 */
const getObstacleType = (energy) => {
  if (energy > 0.8) return "barrier";   // full-lane block, must dodge
  if (energy > 0.5) return "cone";      // smaller, single lane
  return "bump";                         // minor speed bump
};
 
/**
 * Build the speed curve — an array of speed multipliers over the track.
 * BPM drives base speed; energy adds variance on strong sections.
 *
 * @param {number} bpm        - beats per minute
 * @param {number} energy     - Spotify energy 0–1
 * @param {number} beatCount  - total number of beats in the track
 * @returns {{ index: number, speed: number }[]}
 */
const buildSpeedCurve = (bpm, energy, beatCount) => {
    const baseSpeed = bpm / 60; // convert BPM to units per second

    return Array.from({ length: beatCount }, (_, i) => {
    const progress = i / beatCount;
    // Speed ramps up slightly through the song, spikes on high-energy moments
    const speed = baseSpeed * (1 + progress * 0.5) * (1 + energy * 0.3);
    return { index: i, speed: parseFloat(speed.toFixed(3)) };
  });
};

/**
 * Choose a color palette for the track based on Spotify audio features.
 * Valence (happy vs sad) drives hue; energy drives brightness.
 *
 * @param {number} energy  - Spotify energy 0–1
 * @param {number} valence - Spotify valence 0–1 (sad → happy)
 * @returns {{ primary: string, secondary: string, accent: string, background: string }}
 */
const buildColorPalette = (energy, valence) => {
  // High valence = warm/happy colors; low valence = cool/moody colors
  if (valence > 0.6) {
    return {
      primary: "#FF6B35",    // warm orange
      secondary: "#FFD23F",  // yellow
      accent: "#FF1744",     // red accent
      background: "#1A0A00",
    };
  } else if (valence > 0.3) {
    return {
      primary: "#00E5FF",    // cyan
      secondary: "#7C4DFF",  // purple
      accent: "#00BFA5",     // teal accent
      background: "#000A1A",
    };
  } else {
    return {
      primary: "#546E7A",    // cool blue-grey
      secondary: "#37474F",  // dark slate
      accent: "#B0BEC5",     // silver accent
      background: "#050A0D",
    };
  }
};
 
module.exports = { generateTrack };