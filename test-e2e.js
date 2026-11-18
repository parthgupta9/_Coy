const http = require('node:http');
const assert = require('node:assert');
const path = require('node:path');

// Helper to make HTTP request
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2E() {
  console.log('🚀 Running End-to-End HTTP Integration Test Suite...\n');

  // Start the server by requiring it or spawning it
  const { spawn } = require('node:child_process');
  const serverProc = spawn('node', ['backend/src/server.js'], {
    stdio: ['ignore', 'pipe', 'inherit'],
    shell: true
  });

  // Wait for server to boot
  await new Promise((resolve) => {
    serverProc.stdout.on('data', (d) => {
      const msg = d.toString();
      if (msg.includes('Coy Backend Server running')) {
        resolve();
      }
    });
    setTimeout(resolve, 1500); // fallback timeout
  });

  console.log('✓ Backend server booted successfully.\n');

  try {
    // 1. Reset database to fresh state
    console.log('1. Testing POST /reset...');
    const resetRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/reset',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(resetRes.status, 200);
    assert.strictEqual(resetRes.body.success, true);
    console.log('   ✓ Database reset confirmed.');

    // 2. Test GET /feed
    console.log('2. Testing GET /feed...');
    const feedRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/feed',
      method: 'GET'
    });
    assert.strictEqual(feedRes.status, 200);
    assert.strictEqual(feedRes.body.success, true);
    assert.strictEqual(feedRes.body.profiles.length, 35);
    console.log(`   ✓ Received ${feedRes.body.profiles.length} profiles from /feed.`);

    // 3. Verify Privacy Promise (Core Coy Requirement)
    console.log('3. Verifying Privacy: has_liked_user MUST NOT be exposed in /feed...');
    for (const p of feedRes.body.profiles) {
      assert.strictEqual(p.has_liked_user, undefined, `Leaked secret has_liked_user on ${p.name}!`);
    }
    console.log('   ✓ Privacy promise intact. No incoming likes leaked to client.');

    // 4. Test POST /swipe with like on p1 (has_liked_user = 0)
    console.log('4. Testing POST /swipe (Like on p1 - non-mutual)...');
    const swipe1 = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/swipe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { profileId: 'p1', action: 'like' });

    assert.strictEqual(swipe1.status, 200);
    assert.strictEqual(swipe1.body.match, false);
    console.log('   ✓ Correctly returned match = false (one-sided like is kept secret).');

    // 5. Test POST /swipe with like on p2 (Maya - has_liked_user = 1)
    console.log('5. Testing POST /swipe (Like on p2 - mutual match!)...');
    const swipe2 = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/swipe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { profileId: 'p2', action: 'like' });

    assert.strictEqual(swipe2.status, 200);
    assert.strictEqual(swipe2.body.match, true);
    assert.ok(swipe2.body.profile);
    assert.strictEqual(swipe2.body.profile.name, 'Maya');
    console.log(`   ✓ Match detected! Created mutual match with ${swipe2.body.profile.name}.`);

    // 6. Test GET /matches
    console.log('6. Testing GET /matches...');
    const matchesRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/matches',
      method: 'GET'
    });
    assert.strictEqual(matchesRes.status, 200);
    assert.strictEqual(matchesRes.body.matches.length, 1);
    assert.strictEqual(matchesRes.body.matches[0].name, 'Maya');
    assert.ok(matchesRes.body.matches[0].matched_at);
    console.log('   ✓ Returned mutual matches list with Maya.');

    // 7. Verify Swiped Profiles NEVER appear in feed again
    console.log('7. Verifying Persistence & Feed filtering...');
    const feedRes2 = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/feed',
      method: 'GET'
    });
    assert.strictEqual(feedRes2.status, 200);
    assert.strictEqual(feedRes2.body.profiles.length, 33);
    const remainingIds = feedRes2.body.profiles.map(p => p.id);
    assert.ok(!remainingIds.includes('p1'));
    assert.ok(!remainingIds.includes('p2'));
    console.log('   ✓ Profiles p1 and p2 are permanently excluded from feed.');

    // 8. Test static frontend serving
    console.log('8. Testing Static Frontend HTML Delivery...');
    const htmlRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/',
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(htmlRes.status, 200);
    assert.ok(htmlRes.raw.includes('<div id="root"></div>'));
    console.log('   ✓ Static HTML page served correctly.');

    console.log('\n🎉 ALL E2E HTTP INTEGRATION TESTS PASSED PERFECTLY!\n');
  } finally {
    serverProc.kill();
  }
}

runE2E().catch(err => {
  console.error('❌ E2E failed:', err);
  process.exit(1);
});
