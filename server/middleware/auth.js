/**
 * @file auth.js
 * @description Authentication middleware.
 *              Validates a simple session token on protected routes.
 *              Extend this with JWT or Spotify OAuth as needed.
 * @author Ayush Rabadia
 * @version 5/22/2026
 */
 
/**
 * Middleware that checks for a valid session token in the
 * Authorization header. Format: "Bearer <token>"
 *
 * @param {import('express').Request}  req  - Express request
 * @param {import('express').Response} res  - Express response
 * @param {import('express').NextFunction} next - Next middleware
 * @returns {void}
 */
const authMiddleware = (req, res, next) => { 
    const authHeader = req.headers.authorization["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token from the "Bearer <token>" format

    // TODO: Implement actual token validation logic here
    // Here you would typically validate the token (e.g., check against a database or verify with a JWT library)
    // For now, we'll just simulate a valid token
    if (!token || token.length < 10) {
        return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }

    // Attach a minimal user object to the request for downstream handlers (optional)
    req.user = { token }; // Replace with actual user data from token
    next();
};

module.exports = authMiddleware;