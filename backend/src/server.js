const express = require('express');
const cors = require('cors');
const path = require('node:path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Serve frontend static build if available
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// --- API ENDPOINTS ---

// 1. GET /feed (and /api/feed)
// Returns profiles the logged-in user has not yet swiped on.
// Note: has_liked_user is NEVER exposed to the frontend (core Coy privacy promise).
const handleGetFeed = (req, res) => {
  try {
    const profiles = db.getFeed();
    res.json({
      success: true,
      count: profiles.length,
      profiles
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.get('/feed', handleGetFeed);
app.get('/api/feed', handleGetFeed);

// 2. POST /swipe (and /api/swipe)
// Records a swipe ('like' | 'pass') on a profile.
// If both users like each other, creates a mutual match and returns { match: true, profile: ... }.
const handlePostSwipe = (req, res) => {
  try {
    const { profileId, action } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'profileId is required' });
    }

    if (!action || !['like', 'pass'].includes(action)) {
      return res.status(400).json({ success: false, error: 'action must be "like" or "pass"' });
    }

    const result = db.recordSwipe(profileId, action);
    res.json({
      success: true,
      profileId,
      action,
      match: result.match,
      profile: result.profile
    });
  } catch (error) {
    console.error('Error processing swipe:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.post('/swipe', handlePostSwipe);
app.post('/api/swipe', handlePostSwipe);

// 3. GET /matches (and /api/matches)
// Returns all mutual matches for the user.
const handleGetMatches = (req, res) => {
  try {
    const matches = db.getMatches();
    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.get('/matches', handleGetMatches);
app.get('/api/matches', handleGetMatches);

// 4. POST /reset (and /api/reset)
// Resets swipes and matches for demo re-testing.
const handleReset = (req, res) => {
  try {
    const result = db.resetDatabase();
    const stats = db.getStats();
    res.json({
      success: true,
      message: 'Demo state reset successfully. Feed reseeded with 35 profiles.',
      stats
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
app.post('/reset', handleReset);
app.post('/api/reset', handleReset);

// 5. GET /health & /stats
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/stats', (req, res) => {
  try {
    res.json({ success: true, ...db.getStats() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback for SPA routing if serving frontend dist
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    const indexHtml = path.join(frontendDist, 'index.html');
    res.sendFile(indexHtml, (err) => {
      if (err) next();
    });
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Coy Backend Server running on port ${PORT}`);
  console.log(` Feed endpoint:    GET  http://localhost:${PORT}/feed`);
  console.log(` Swipe endpoint:   POST http://localhost:${PORT}/swipe`);
  console.log(` Matches endpoint: GET  http://localhost:${PORT}/matches`);
  console.log(` Reset endpoint:   POST http://localhost:${PORT}/reset`);
  console.log(`=========================================`);
});
