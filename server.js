const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "fraud_safe"
});

// Connect to MySQL
db.connect(function(error) {

    if (error) {
        console.log("❌ MySQL connection failed:");
        console.log(error.message);
        return;
    }

    console.log("✅ MySQL connected successfully!");
    console.log("✅ Database: fraud_safe");

});


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

        // Check existing email
        db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async function(error, results) {

                if (error) {

                    console.log(error);

                    return res.status(500).json({
                        message: "Database error."
                    });

                }

                if (results.length > 0) {

                    return res.status(409).json({
                        message: "Email already registered."
                    });

                }

                // Hash password
                const passwordHash =
                    await bcrypt.hash(password, 10);

                // Insert user
                db.query(
                    `INSERT INTO users
                    (name, email, password_hash)
                    VALUES (?, ?, ?)`,
                    [name, email, passwordHash],
                    function(error) {

                        if (error) {

                            console.log(error);

                            return res.status(500).json({
                                message: "Registration failed."
                            });

                        }

                        res.status(201).json({
                            message: "Registration successful."
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error."
        });

    }

});


// ================= LOGIN =================

app.post("/api/login", function(req, res) {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            message: "Please enter email and password."
        });

    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async function(error, results) {

            if (error) {

                console.log(error);

                return res.status(500).json({
                    message: "Database error."
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    message: "Invalid email or password."
                });

            }

            const user = results[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password_hash
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    message: "Invalid email or password."
                });

            }

            // Create JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                "FRAUD_SAFE_SECRET_2026",
                {
                    expiresIn: "2h"
                }
            );

            // Store token in HTTP-only cookie
            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "lax",
                maxAge: 2 * 60 * 60 * 1000
            });

            res.json({
                message: "Login successful.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });

        }
    );

});


// ================= CHECK LOGIN =================

app.get("/api/me", function(req, res) {

    const token = req.cookies.token;

    if (!token) {

        return res.status(401).json({
            message: "Not logged in."
        });

    }

    try {

        const decoded =
            jwt.verify(
                token,
                "FRAUD_SAFE_SECRET_2026"
            );

        db.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [decoded.id],
            function(error, results) {

                if (error || results.length === 0) {

                    return res.status(401).json({
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