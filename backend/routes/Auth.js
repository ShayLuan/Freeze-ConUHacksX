const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
  // create user
  res.json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
  // authenticate user
  res.json({ message: "User logged in" });
});

module.exports = router;
