
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (
        typeof authHeader !== "string" ||
        !authHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authHeader.slice(7).trim();

    if (!token || token.length > 4096 || token.includes(" ")) {
        return res.status(401).json({
            message: "Invalid authentication token"
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured");

        return res.status(500).json({
            message: "Authentication unavailable"
        });
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"],
                issuer: "ai-maintenance-assistant",
                audience: "ai-maintenance-assistant-users"
            }
        );

        if (!mongoose.isValidObjectId(payload.sub)) {
            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }

        const user = await User.findById(payload.sub);

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role
        };

        return next();

    } catch (err) {
        if (
            err.name === "TokenExpiredError" ||
            err.name === "JsonWebTokenError" ||
            err.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("Authentication error:", err.message);

        return res.status(503).json({
            message: "Authentication temporarily unavailable"
        });
    }
}

module.exports = requireAuth;
