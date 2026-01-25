const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

// Register/Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { username, email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if email already exists
    const [emailExists] = await db.query(
      "SELECT user_id FROM User WHERE email = ?",
      [email]
    );

    if (emailExists.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Check if username already exists (if provided)
    if (username) {
      const [usernameExists] = await db.query(
        "SELECT user_id FROM User WHERE username = ?",
        [username]
      );

      if (usernameExists.length > 0) {
        return res.status(409).json({ error: "Username already taken" });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO User (username, email, password) VALUES (?, ?, ?)",
      [username || null, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const [User] = await db.query(
      "SELECT user_id, username, email, password FROM User WHERE email = ?",
      [email]
    );

    if (User.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = User[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Login successful - return user info (without password)
    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
