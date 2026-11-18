const path = require('node:path');
const fs = require('node:fs');
const { mockProfiles } = require('./mockProfiles');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'coy.db');
const JSON_BACKUP_PATH = path.join(DATA_DIR, 'db_backup.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db = null;
let useJsonFallback = false;

// Initialize Database using Node 22 native SQLite
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);

  // Initialize Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      photo TEXT NOT NULL,
      bio TEXT NOT NULL,
      city_or_college TEXT NOT NULL,
      job TEXT,
      distance TEXT,
      interests TEXT NOT NULL,
      has_liked_user INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id TEXT NOT NULL UNIQUE,
      action TEXT NOT NULL CHECK(action IN ('like', 'pass')),
      swiped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id TEXT NOT NULL UNIQUE,
      matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );
  `);

  console.log('[DB] Native SQLite initialized at', DB_PATH);
} catch (err) {
  console.warn('[DB] SQLite initialization failed, using resilient JSON storage fallback:', err.message);
  useJsonFallback = true;
}

// Fallback in-memory/JSON store
let jsonStore = {
  profiles: [...mockProfiles],
  swipes: [], // { profile_id, action, swiped_at }
  matches: [] // { profile_id, matched_at }
};

function saveJsonStore() {
  try {
    fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(jsonStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write JSON backup:', e);
  }
}

function loadJsonStore() {
  try {
    if (fs.existsSync(JSON_BACKUP_PATH)) {
      jsonStore = JSON.parse(fs.readFileSync(JSON_BACKUP_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load JSON backup:', e);
  }
}

if (useJsonFallback) {
  loadJsonStore();
}

// Helper to sanitize profile for client (NEVER leak has_liked_user)
function sanitizeProfile(p) {
  if (!p) return null;
  const interests = typeof p.interests === 'string' ? JSON.parse(p.interests) : p.interests;
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    photo: p.photo,
    bio: p.bio,
    city_or_college: p.city_or_college,
    job: p.job || '',
    distance: p.distance || '',
    interests: interests || []
  };
}

// Seed initial profiles if empty
function seedProfiles() {
  if (!useJsonFallback && db) {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM profiles').get();
    if (countRow.count === 0) {
      console.log('[DB] Seeding', mockProfiles.length, 'profiles into SQLite...');
      const insert = db.prepare(`
        INSERT INTO profiles (id, name, age, photo, bio, city_or_college, job, distance, interests, has_liked_user)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of mockProfiles) {
        insert.run(
          p.id,
          p.name,
          p.age,
          p.photo,
          p.bio,
          p.city_or_college,
          p.job,
          p.distance,
          JSON.stringify(p.interests),
          p.has_liked_user
        );
      }
      console.log('[DB] Seeding complete.');
    }
  } else {
    if (!jsonStore.profiles || jsonStore.profiles.length === 0) {
      jsonStore.profiles = [...mockProfiles];
      saveJsonStore();
    }
  }
}

// 1. GET FEED: profiles not yet swiped on
function getFeed() {
  if (!useJsonFallback && db) {
    const query = `
      SELECT id, name, age, photo, bio, city_or_college, job, distance, interests
      FROM profiles
      WHERE id NOT IN (SELECT profile_id FROM swipes)
      ORDER BY id ASC
    `;
    const rows = db.prepare(query).all();
    return rows.map(sanitizeProfile);
  } else {
    const swipedIds = new Set(jsonStore.swipes.map(s => s.profile_id));
    return jsonStore.profiles
      .filter(p => !swipedIds.has(p.id))
      .map(sanitizeProfile);
  }
}

// 2. POST SWIPE: record like or pass, return match status
function recordSwipe(profileId, action) {
  if (!['like', 'pass'].includes(action)) {
    throw new Error('Action must be either "like" or "pass"');
  }

  if (!useJsonFallback && db) {
    // Check if profile exists
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId);
    if (!profile) {
      throw new Error(`Profile with id "${profileId}" not found`);
    }

    // Insert swipe record (or ignore if already exists)
    try {
      db.prepare('INSERT INTO swipes (profile_id, action) VALUES (?, ?)').run(profileId, action);
    } catch (err) {
      // Profile already swiped
      console.log(`[DB] Profile ${profileId} was already swiped`);
    }

    let isMatch = false;
    if (action === 'like' && profile.has_liked_user === 1) {
      isMatch = true;
      try {
        db.prepare('INSERT OR IGNORE INTO matches (profile_id) VALUES (?)').run(profileId);
      } catch (err) {
        console.error('[DB] Match insert error:', err);
      }
    }

    return {
      match: isMatch,
      profile: isMatch ? sanitizeProfile(profile) : undefined
    };
  } else {
    const profile = jsonStore.profiles.find(p => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile with id "${profileId}" not found`);
    }

    // Check if already swiped
    if (!jsonStore.swipes.some(s => s.profile_id === profileId)) {
      jsonStore.swipes.push({
        profile_id: profileId,
        action,
        swiped_at: new Date().toISOString()
      });
    }

    let isMatch = false;
    if (action === 'like' && profile.has_liked_user === 1) {
      isMatch = true;
      if (!jsonStore.matches.some(m => m.profile_id === profileId)) {
        jsonStore.matches.push({
          profile_id: profileId,
          matched_at: new Date().toISOString()
        });
      }
    }

    saveJsonStore();
    return {
      match: isMatch,
      profile: isMatch ? sanitizeProfile(profile) : undefined
    };
  }
}

// 3. GET MATCHES: mutual matches with profile details
function getMatches() {
  if (!useJsonFallback && db) {
    const query = `
      SELECT p.id, p.name, p.age, p.photo, p.bio, p.city_or_college, p.job, p.distance, p.interests, m.matched_at
      FROM matches m
      JOIN profiles p ON m.profile_id = p.id
      ORDER BY m.matched_at DESC
    `;
    const rows = db.prepare(query).all();
    return rows.map(r => ({
      ...sanitizeProfile(r),
      matched_at: r.matched_at
    }));
  } else {
    const matchMap = new Map(jsonStore.matches.map(m => [m.profile_id, m.matched_at]));
    return jsonStore.profiles
      .filter(p => matchMap.has(p.id))
      .map(p => ({
        ...sanitizeProfile(p),
        matched_at: matchMap.get(p.id)
      }))
      .sort((a, b) => new Date(b.matched_at) - new Date(a.matched_at));
  }
}

// 4. RESET: clear swipes and matches for fresh demo
function resetDatabase() {
  if (!useJsonFallback && db) {
    db.exec('DELETE FROM swipes;');
    db.exec('DELETE FROM matches;');
    db.exec('DELETE FROM profiles;');
    seedProfiles();
  } else {
    jsonStore.swipes = [];
    jsonStore.matches = [];
    jsonStore.profiles = [...mockProfiles];
    saveJsonStore();
  }
  return { success: true, message: 'Database reset successfully' };
}

// Stats helper
function getStats() {
  if (!useJsonFallback && db) {
    const total = db.prepare('SELECT COUNT(*) as c FROM profiles').get().c;
    const swiped = db.prepare('SELECT COUNT(*) as c FROM swipes').get().c;
    const matches = db.prepare('SELECT COUNT(*) as c FROM matches').get().c;
    return { total, swiped, matches, remaining: total - swiped };
  } else {
    return {
      total: jsonStore.profiles.length,
      swiped: jsonStore.swipes.length,
      matches: jsonStore.matches.length,
      remaining: jsonStore.profiles.length - jsonStore.swipes.length
    };
  }
}

// Run initial seed
seedProfiles();

module.exports = {
  getFeed,
  recordSwipe,
  getMatches,
  resetDatabase,
  getStats
};
