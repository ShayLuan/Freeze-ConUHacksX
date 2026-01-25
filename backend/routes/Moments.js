const express = require("express");
const router = express.Router();

// GET all moments for a specific user
router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { user_id } = req.query;

    // Validate user_id is provided
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Verify user_id is a valid number
    const userId = parseInt(user_id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    // Fetch moments for this user only
    const [moments] = await db.query(
      "SELECT * FROM Moments WHERE user_id = ? ORDER BY created_at DESC, date DESC",
      [userId]
    );

    res.json({ moments });
  } catch (error) {
    console.error("Error fetching moments:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST create a new moment for a user
router.post("/", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { user_id, moments_url, date, description, reminder } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Verify user_id is a valid number
    const userId = parseInt(user_id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    // Verify user exists
    const [userExists] = await db.query(
      "SELECT user_id FROM User WHERE user_id = ?",
      [userId]
    );

    if (userExists.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Insert new moment
    const [result] = await db.query(
      "INSERT INTO Moments (user_id, moments_url, date, description, reminder) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        moments_url || null,
        date || null,
        description || null,
        reminder !== undefined ? reminder : null,
      ]
    );

    // Fetch the created moment
    const [newMoment] = await db.query(
      "SELECT * FROM Moments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    res.status(201).json({
      message: "Moment created successfully",
      moment: newMoment[0],
    });
  } catch (error) {
    console.error("Error creating moment:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE a moment (only if it belongs to the user)
// IMPORTANT: Adjust queries based on your actual Moments table schema
// If Moments has moment_id as PK: use "WHERE moment_id = ? AND user_id = ?"
// If Moments has user_id as PK: use "WHERE user_id = ?"
router.delete("/:momentId", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { momentId } = req.params;
    const { user_id } = req.query;

    // Validate user_id is provided
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const userId = parseInt(user_id);
    const momentIdInt = parseInt(momentId);

    if (isNaN(userId) || isNaN(momentIdInt)) {
      return res.status(400).json({ error: "Invalid user_id or moment_id" });
    }

    // Check if the moment exists and belongs to this user
    // TODO: Adjust this query based on your actual schema
    // If you have moment_id as PK: "SELECT user_id FROM Moments WHERE moment_id = ? AND user_id = ?"
    // If user_id is the PK: "SELECT user_id FROM Moments WHERE user_id = ?"
    const [moment] = await db.query(
      "SELECT user_id FROM Moments WHERE user_id = ? AND user_id = ? LIMIT 1",
      [momentIdInt, userId]
    );

    if (moment.length === 0) {
      return res.status(404).json({ error: "Moment not found or you don't have permission to delete it" });
    }

    // Verify the moment belongs to the requesting user
    if (moment[0].user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own moments" });
    }

    // Delete the moment
    // TODO: Adjust this query - if moment_id is PK: "DELETE FROM Moments WHERE moment_id = ? AND user_id = ?"
    await db.query(
      "DELETE FROM Moments WHERE user_id = ? AND user_id = ? LIMIT 1",
      [momentIdInt, userId]
    );

    res.json({ message: "Moment deleted successfully" });
  } catch (error) {
    console.error("Error deleting moment:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;