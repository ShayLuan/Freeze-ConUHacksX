const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const db = req.app.locals.db;
    // imma add later code to create user
    res.json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = req.app.locals.db;
    // add later code to authenticate user
    res.json({ message: "User logged in" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
