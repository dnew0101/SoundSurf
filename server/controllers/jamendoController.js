const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

const searchTracks = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${process.env.JAMENDO_CLIENT_ID}&client_secret=${process.env.JAMENDO_CLIENT_SECRET}&format=json&search=${encodeURIComponent(q)}&limit=${limit}&include=musicinfo`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.headers?.status !== "success") {
      return res.status(500).json({ error: "Jamendo API error" });
    }

    const tracks = data.results.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name,
      audio: track.audio,
      albumArt: track.image,
      duration: track.duration,
    }));

    res.json(tracks);
  } catch (error) {
    console.error("Jamendo search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getConfig = async (req, res) => {
  res.json({
    clientId: process.env.JAMENDO_CLIENT_ID,
  });
};

module.exports = { searchTracks, getConfig };
