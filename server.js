const express = require("express");
const {Pool} = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));

// PostgreSQL Connection
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Connect to MySQL
db.query("SELECT NOW()")
    .then(() => console.log("✅ PostgreSQL connected successfully!"))
    .catch(error => console.error("❌ PostgreSQL connection failed:", error.message));

// ================= REGISTER =================

app.post("/api/register", async function(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please fill all fields."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters."
        });
    }

    try {
        const existingUser = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)`,
            [name, email, passwordHash]
        );

        return res.status(201).json({
            message: "Registration successful."
        });

    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});


// ================= LOGIN =================

app.post("/api/login", async function(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter email and password."
        });
    }

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            maxAge: 2 * 60 * 60 * 1000
        });

        return res.json({
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});

// ================= CHECK LOGIN =================

app.get("/api/me", async function(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Not logged in."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await db.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        return res.json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Check login error:", error.message);

        return res.status(401).json({
            message: "Session expired."
        });
    }
});

// ================= LOGOUT =================

app.post("/api/logout", function(req, res) {

    res.clearCookie("token");

    res.json({
        message: "Logout successful."
    });

});


// ================= PROFILE =================

app.get("/api/profile", function(req, res) {

    const token = req.cookies.token;

    if (!token) {

        return res.status(401).json({
            message: "Please login first."
        });

    }

    try {

        const decoded =
            jwt.verify(
                token,
                "FRAUD_SAFE_SECRET_2026"
            );

        db.query(
            "SELECT id, name, email, created_at FROM users WHERE id = ?",
            [decoded.id],
            function(error, results) {

                if (error || results.length === 0) {

                    return res.status(404).json({
                        message: "User not found."
                    });

                }

                res.json({
                    user: results[0]
                });

            }
        );

    } catch (error) {

        res.status(401).json({
            message: "Invalid or expired session."
        });

    }

});


// ================= HOME PAGE =================

app.get("/", function(req, res) {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ================= START SERVER =================

app.listen(PORT, function() {

    console.log("");
    console.log("=================================");
    console.log("🛡️ FraudSafe Server Started");
    console.log("=================================");
    console.log("Website: http://localhost:" + PORT);
    console.log("Database: fraud_safe");
    console.log("=================================");

});
