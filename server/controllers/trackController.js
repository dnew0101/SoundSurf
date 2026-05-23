/**
 * @file trackController.js
 * @description Converts audio analysis data (BPM + beat grid from Tam's WASM)
 *              into a deterministic track configuration for David's R3F frontend.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

/**
 * Generate a complete track configuration from audio analysis data.
 * @param {import('express').Request}  req - body: { bpm, beatGrid, energy, valence }
 * @param {import('express').Response} res
 */
const generateTrack = (req, res) => {
  try {
    const { bpm, beatGrid, energy = 0.5, valence = 0.5 } = req.body;

    if (!bpm || !beatGrid || !Array.isArray(beatGrid)) {
      return res.status(400).json({
        error: "bpm (number) and beatGrid (number[]) are required",
      });
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
 * @param {number[]} beatGrid
 * @param {number}   energy
 */
const buildSplinePoints = (beatGrid, energy) => {
  return beatGrid.map((timestamp, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const curveAmount = energy * 8;
    return {
      x: side * curveAmount * Math.sin(i * 0.5),
      y: Math.sin(i * 0.3) * energy * 3,
      z: -(i * 10),
      timestamp,
    };
  });
};

/**
 * Build the obstacle schedule from the beat grid.
 * @param {number[]} beatGrid
 * @param {number}   bpm
 * @param {number}   energy
 */
const buildObstacleSchedule = (beatGrid, bpm, energy) => {
  const spawnInterval = energy > 0.7 ? 1 : 2;
  return beatGrid
    .filter((_, i) => i % spawnInterval === 0)
    .map((timestamp) => ({
      timestamp,
      type: getObstacleType(energy),
      lane: Math.floor(Math.random() * 3) - 1,
    }));
};

/**
 * Get obstacle type based on energy.
 * @param {number} energy
 */
const getObstacleType = (energy) => {
  if (energy > 0.8) return "barrier";
  if (energy > 0.5) return "cone";
  return "bump";
};

/**
 * Build speed curve over the track.
 * @param {number} bpm
 * @param {number} energy
 * @param {number} beatCount
 */
const buildSpeedCurve = (bpm, energy, beatCount) => {
  const baseSpeed = bpm / 60;
  return Array.from({ length: beatCount }, (_, i) => {
    const progress = i / beatCount;
    const speed = baseSpeed * (1 + progress * 0.5) * (1 + energy * 0.3);
    return { index: i, speed: parseFloat(speed.toFixed(3)) };
  });
};

/**
 * Build color palette from Spotify valence and energy.
 * @param {number} energy
 * @param {number} valence
 */
const buildColorPalette = (energy, valence) => {
  if (valence > 0.6) {
    return {
      primary: "#FF6B35",
      secondary: "#FFD23F",
      accent: "#FF1744",
      background: "#1A0A00",
    };
  } else if (valence > 0.3) {
    return {
      primary: "#00E5FF",
      secondary: "#7C4DFF",
      accent: "#00BFA5",
      background: "#000A1A",
    };
  } else {
    return {
      primary: "#546E7A",
      secondary: "#37474F",
      accent: "#B0BEC5",
      background: "#050A0D",
    };
  }
};

module.exports = { generateTrack };