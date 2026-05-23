/**
 * @file cors.js
 * @description CORS middleware configuration.
 *              Allows the React client (localhost:5173) to communicate
 *              with this Express server during development.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */

const cors = require("cors");

/**
 * Allowed origins. Add production URL here when deploying.
 * @type {string[]}
 */
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000",
];

/**
 * CORS options — only allow listed origins, standard HTTP methods,
 * and the Content-Type / Authorization headers the client needs.
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

module.exports = cors(corsOptions);