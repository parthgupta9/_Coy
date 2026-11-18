const assert = require('node:assert');
const path = require('node:path');
const express = require('./backend/node_modules/express');
const cors = require('./backend/node_modules/cors');
const db = require('./backend/src/db');

// Build test express app matching server.js
const app = express();
app.use(cors());
app.use(express.json());

app.get('/feed', (req, res) => {
  const profiles = db.getFeed();
  res.json({ success: true, count: profiles.length, profiles });
});

app.post('/swipe', (req, res) => {
  const { profileId, action } = req.body;
  if (!profileId || !['like', 'pass'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }
  const result = db.recordSwipe(profileId, action);
  res.json({ success: true, match: result.match, profile: result.profile });
});

app.get('/matches', (req, res) => {
  const matches = db.getMatches();
  res.json({ success: true, count: matches.length, matches });
});

app.post('/reset', (req, res) => {
  db.resetDatabase();
  res.json({ success: true, count: 35 });
});

// Mock request / response dispatcher
function invoke(method, url, body = null) {
  return new Promise((resolve) => {
    const { EventEmitter } = require('node:events');
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { 'content-type': 'application/json' };
    req.body = body || {};

    const res = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(k, v) {
        this.headers[k] = v;
      },
      json(data) {
        resolve({ status: this.statusCode, body: data });
      },
      send(data) {
        resolve({ status: this.statusCode, raw: data });
      }
    };

    app.handle(req, res);
  });
}

async function runInProcessTests() {
  console.log('🚀 Running Express In-Process Integration Tests...\n');

  // 1. Reset
  console.log('1. Testing POST /reset...');
  const resetRes = await invoke('POST', '/reset');
  assert.strictEqual(resetRes.status, 200);
  assert.strictEqual(resetRes.body.success, true);
  console.log('   ✓ Database reset confirmed.');

  // 2. Feed
  console.log('2. Testing GET /feed...');
  const feedRes = await invoke('GET', '/feed');
  assert.strictEqual(feedRes.status, 200);
  assert.strictEqual(feedRes.body.success, true);
  assert.strictEqual(feedRes.body.profiles.length, 35);
  console.log(`   ✓ Received ${feedRes.body.profiles.length} profiles from /feed.`);

  // 3. Privacy check
  console.log('3. Verifying Privacy: has_liked_user MUST NOT be exposed in /feed...');
  for (const p of feedRes.body.profiles) {
    assert.strictEqual(p.has_liked_user, undefined, `Leaked secret has_liked_user on ${p.name}!`);
    assert.ok(p.id && p.name && p.photo && p.bio && p.city_or_college && p.interests);
  }
  console.log('   ✓ Privacy promise verified. Zero incoming likes leaked.');

  // 4. Swipe Like on non-matching profile (p1)
  console.log('4. Testing POST /swipe (Like on p1 - non-mutual)...');
  const swipe1 = await invoke('POST', '/swipe', { profileId: 'p1', action: 'like' });
  assert.strictEqual(swipe1.status, 200);
  assert.strictEqual(swipe1.body.match, false);
  assert.strictEqual(swipe1.body.profile, undefined);
  console.log('   ✓ Correctly returned match = false.');

  // 5. Swipe Like on matching profile (p2 - Maya)
  console.log('5. Testing POST /swipe (Like on p2 - mutual match!)...');
  const swipe2 = await invoke('POST', '/swipe', { profileId: 'p2', action: 'like' });
  assert.strictEqual(swipe2.status, 200);
  assert.strictEqual(swipe2.body.match, true);
  assert.strictEqual(swipe2.body.profile.name, 'Maya');
  console.log(`   ✓ Mutual match created with ${swipe2.body.profile.name}!`);

  // 6. Matches
  console.log('6. Testing GET /matches...');
  const matchesRes = await invoke('GET', '/matches');
  assert.strictEqual(matchesRes.status, 200);
  assert.strictEqual(matchesRes.body.matches.length, 1);
  assert.strictEqual(matchesRes.body.matches[0].name, 'Maya');
  console.log('   ✓ GET /matches returns mutual match.');

  // 7. Feed filtering & persistence
  console.log('7. Verifying Swiped Profiles Filtered Out of Feed...');
  const feedRes2 = await invoke('GET', '/feed');
  assert.strictEqual(feedRes2.status, 200);
  assert.strictEqual(feedRes2.body.profiles.length, 33);
  const remainingIds = feedRes2.body.profiles.map(p => p.id);
  assert.ok(!remainingIds.includes('p1'));
  assert.ok(!remainingIds.includes('p2'));
  console.log('   ✓ Both p1 and p2 permanently excluded from feed.');

  // 8. Swipe Pass
  console.log('8. Testing POST /swipe (Pass on p3)...');
  const pass3 = await invoke('POST', '/swipe', { profileId: 'p3', action: 'pass' });
  assert.strictEqual(pass3.status, 200);
  assert.strictEqual(pass3.body.match, false);
  const feedRes3 = await invoke('GET', '/feed');
  assert.strictEqual(feedRes3.body.profiles.length, 32);
  console.log('   ✓ Pass action successfully recorded and profile excluded.');

  console.log('\n🎉 ALL EXPRESS INTEGRATION TESTS PASSED CLEANLY!\n');
}

runInProcessTests().catch(err => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
