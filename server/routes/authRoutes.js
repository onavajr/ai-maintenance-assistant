const express = require('express');
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");

const User = require("../models/User");
const { verifyPassword } = require("../services/passwordService");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Try again later."
    }
});

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password ||
            email.length > 254 ||
            password.length > 1024
        ) {
            return res.status(400).json({
                message: "Valid email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+passwordHash");

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const validPassword = await verifyPassword(
            user.passwordHash,
            password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {},
            process.env.JWT_SECRET,
            {
                subject: user._id.toString(),
                algorithm: "HS256",
                expiresIn: "15m",
                issuer: "ai-maintenance-assistant",
                audience: "ai-maintenance-assistant-users"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error("Login error:", err.message);

        return res.status(500).json({
            message: "Unable to process login"
        });
    }
});

module.exports = router;