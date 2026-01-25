const express = require("express");
const multer = require("multer");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../utils/upload");

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

    // fetch moments (newest first)
    const [moments] = await db.query(
      "SELECT * FROM Moments WHERE user_id = ? ORDER BY date DESC, created_at DESC",
      [userId]
    );

    res.json({ moments });
  } catch (error) {
    console.error("Error fetching moments:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST create a new moment for a user (with optional image upload)
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      // Handle other errors (like file type)
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
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

    // Handle moments_url - it's NOT NULL, so use empty string if no image
    let imageUrl = moments_url || '';

    // If a file was uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, "moments");
        console.log("✅ Image uploaded to Cloudinary:", imageUrl);
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(500).json({ error: "Failed to upload image. Please try again." });
      }
    }

    // Calculate the next moments_id for this user (moments_id is NOT auto_increment)
    // Since moments_id is part of composite primary key (user_id, moments_id)
    const [maxMoment] = await db.query(
      "SELECT COALESCE(MAX(moments_id), 0) + 1 AS next_id FROM Moments WHERE user_id = ?",
      [userId]
    );
    const momentsId = maxMoment[0]?.next_id || 1;

    // Insert new moment with moments_id (required since it's NOT auto_increment)
    // moments_url must be provided (NOT NULL constraint) - using empty string if no image
    const [result] = await db.query(
      "INSERT INTO Moments (moments_id, user_id, moments_url, date, description, reminder) VALUES (?, ?, ?, ?, ?, ?)",
      [
        momentsId,
        userId,
        imageUrl, // Empty string if no image (NOT NULL constraint)
        date || null,
        description || null,
        reminder !== undefined ? reminder : null,
      ]
    );

    // Fetch the created moment using the composite key
    const [newMoment] = await db.query(
      "SELECT * FROM Moments WHERE moments_id = ? AND user_id = ?",
      [momentsId, userId]
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
// Uses composite primary key: (moments_id, user_id)
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

    // Check if the moment exists and belongs to this user using composite key
    const [moment] = await db.query(
      "SELECT user_id FROM Moments WHERE moments_id = ? AND user_id = ?",
      [momentIdInt, userId]
    );

    if (moment.length === 0) {
      return res.status(404).json({ error: "Moment not found or you don't have permission to delete it" });
    }

    // Verify the moment belongs to the requesting user
    if (moment[0].user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own moments" });
    }

    // Delete the moment using composite key
    await db.query(
      "DELETE FROM Moments WHERE moments_id = ? AND user_id = ?",
      [momentIdInt, userId]
    );

    res.json({ message: "Moment deleted successfully" });
  } catch (error) {
    console.error("Error deleting moment:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
