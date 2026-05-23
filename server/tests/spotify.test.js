/**
 * @file spotify.test.js
 * @description Mock tests for Spotify API routes.
 *              Tests that endpoints return correct shape of data
 *              without needing real Spotify credentials.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const BASE_URL = "http://localhost:8000";

// ─── Mock Data ────────────────────────────────────────────

/** Fake track ID to use across all tests */
const MOCK_TRACK_ID = "06AKEBrKUckW0KREUWRnvT";

/** Fake access token — replace with real one to test live */
const MOCK_TOKEN = "fake_access_token_123";

// ─── Tests ────────────────────────────────────────────────

/**
 * Test 1 — Health check
 * Makes sure the server is running before anything else.
 */
const testHealth = async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  const data = await res.json();

  console.assert(res.status === 200, "❌ Health check failed");
  console.assert(data.status === "ok", "❌ Health status should be ok");
  console.log("✅ Test 1 passed: server is running");
};

/**
 * Test 2 — Search endpoint exists
 * Checks that /api/spotify/search returns 401 when no token is given.
 * (Proves the route exists and auth is working)
 */
const testSearchNoToken = async () => {
  const res = await fetch(`${BASE_URL}/api/spotify/search?q=blinding+lights`);

  console.assert(res.status === 401, "❌ Should return 401 with no token");
  console.log("✅ Test 2 passed: search blocked without token");
};

/**
 * Test 3 — Audio features endpoint exists
 * Checks that /api/spotify/features/:id returns 401 with no token.
 */
const testFeaturesNoToken = async () => {
  const res = await fetch(`${BASE_URL}/api/spotify/features/${MOCK_TRACK_ID}`);

  console.assert(res.status === 401, "❌ Should return 401 with no token");
  console.log("✅ Test 3 passed: features blocked without token");
};

/**
 * Test 4 — Preview endpoint exists
 * Checks that /api/spotify/preview/:id returns 401 with no token.
 */
const testPreviewNoToken = async () => {
  const res = await fetch(`${BASE_URL}/api/spotify/preview/${MOCK_TRACK_ID}`);

  console.assert(res.status === 401, "❌ Should return 401 with no token");
  console.log("✅ Test 4 passed: preview blocked without token");
};

/**
 * Test 5 — Token endpoint rejects empty body
 * Checks that /api/spotify/token returns 400 with no code given.
 */
const testTokenNobody = async () => {
  const res = await fetch(`${BASE_URL}/api/spotify/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  console.assert(res.status === 400, "❌ Should return 400 with empty body");
  console.log("✅ Test 5 passed: token endpoint rejects empty body");
};

// ─── Run All Tests ────────────────────────────────────────

/**
 * Runs all mock Spotify tests in sequence.
 */
const runTests = async () => {
  console.log("\n🎵 Running SoundSurf Spotify mock tests...\n");
  try {
    await testHealth();
    await testSearchNoToken();
    await testFeaturesNoToken();
    await testPreviewNoToken();
    await testTokenNobody();
    console.log("\n🏁 All tests done\n");
  } catch (err) {
    console.error("❌ Test crashed:", err.message);
  }
};

runTests();