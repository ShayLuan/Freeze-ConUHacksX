const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// routes
const authRoutes = require('./routes/Auth');
const momentsRoutes = require('./routes/Moments');

app.use("/api/auth", authRoutes);
app.use("/api/moments", momentsRoutes);

// make db available locally
app.locals.db = db;

// Serve index.html as homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Register.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Register.html'));
});

app.get('/timeline', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Timeline.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
