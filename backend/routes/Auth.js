const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const sendEmail = require("../utils/email");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1️⃣ Check if email already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Save user to DB
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // 4️⃣ Send welcome email
    await sendEmail({
      to: email,
      subject: "Welcome to Our App 🎉",
      html: `
        <h2>Welcome, ${username}!</h2>
        <p>Your account has been successfully created.</p>
        <p>Thanks for joining us 🚀</p>
      `
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // 2️⃣ Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3️⃣ Optional: send login email
    await sendEmail({
      to: email,
      subject: "New Login Detected 🔒",
      html: `
        <p>You just logged into your account.</p>
        <p>If this wasn't you, please secure your account immediately.</p>
      `
    });

    res.json({ message: "User logged in successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
