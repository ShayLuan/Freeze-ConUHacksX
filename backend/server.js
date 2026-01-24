const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// routes
const authRoutes = require('./routes/Auth');

app.use("/api/auth", authRoutes);

// make db available locally
app.locals.db = db;

// Test database connection
app.get('/', async (req, res) => {
  try {
    // Test database connection
    const [rows] = await db.query('SELECT 1 as test');
    res.send('Hello World! Database connected successfully!');
  } catch (error) {
    res.status(500).send(`Database connection error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});