const assert = require('node:assert');
const db = require('../src/db');

async function runTests() {
  console.log('🧪 Starting Coy Discovery API & Database Tests...\n');

  // Test 1: Reset database and verify feed
  console.log('1. Testing Database Reset & Feed Seeding...');
  db.resetDatabase();
  const initialFeed = db.getFeed();
  assert.strictEqual(initialFeed.length, 35, `Expected 35 profiles, got ${initialFeed.length}`);
  console.log(`   ✓ Feed returned ${initialFeed.length} seeded profiles.`);

  // Test 2: Verify privacy promise (no leak of has_liked_user)
  console.log('2. Testing Privacy Promise: has_liked_user must NEVER be exposed...');
  for (const profile of initialFeed) {
    assert.strictEqual(profile.has_liked_user, undefined, `Leaked has_liked_user on profile ${profile.id}!`);
    assert.ok(profile.id, 'Profile must have id');
    assert.ok(profile.name, 'Profile must have name');
    assert.ok(profile.age, 'Profile must have age');
    assert.ok(profile.photo, 'Profile must have photo');
    assert.ok(profile.bio, 'Profile must have bio');
    assert.ok(profile.city_or_college, 'Profile must have city_or_college');
    assert.ok(Array.isArray(profile.interests), 'Interests must be an array');
  }
  console.log('   ✓ All profiles sanitized, no secret like status leaked.');

  // Test 3: Swipe on profile that did NOT like user (p1)
  console.log('3. Testing Swipe Like on non-matching profile (p1)...');
  const swipeP1 = db.recordSwipe('p1', 'like');
  assert.strictEqual(swipeP1.match, false, 'Expected no match for p1');
  assert.strictEqual(swipeP1.profile, undefined, 'Expected no profile payload on non-match');
  console.log('   ✓ Swipe recorded, correctly returned match = false.');

  // Test 4: Swipe on profile that DID like user (p2)
  console.log('4. Testing Swipe Like on matching profile (p2 - Maya)...');
  const swipeP2 = db.recordSwipe('p2', 'like');
  assert.strictEqual(swipeP2.match, true, 'Expected match for p2');
  assert.ok(swipeP2.profile, 'Expected matched profile object');
  assert.strictEqual(swipeP2.profile.name, 'Maya', 'Expected match name to be Maya');
  console.log(`   ✓ Match detected! Created mutual match with ${swipeP2.profile.name}.`);

  // Test 5: Verify swiped profiles NEVER appear in feed again
  console.log('5. Testing Swiped Profiles Persistence...');
  const updatedFeed = db.getFeed();
  assert.strictEqual(updatedFeed.length, 33, `Expected 33 profiles remaining, got ${updatedFeed.length}`);
  const feedIds = updatedFeed.map(p => p.id);
  assert.ok(!feedIds.includes('p1'), 'p1 must not appear in feed');
  assert.ok(!feedIds.includes('p2'), 'p2 must not appear in feed');
  console.log('   ✓ Swiped profiles successfully removed from feed.');

  // Test 6: Verify Matches endpoint
  console.log('6. Testing Matches Retrieval...');
  const matches = db.getMatches();
  assert.strictEqual(matches.length, 1, `Expected 1 match, got ${matches.length}`);
  assert.strictEqual(matches[0].id, 'p2');
  assert.strictEqual(matches[0].name, 'Maya');
  assert.ok(matches[0].matched_at, 'Match must have matched_at timestamp');
  console.log('   ✓ Mutual matches correctly returned with timestamps.');

  // Test 7: Swipe Pass on profile (p3)
  console.log('7. Testing Pass action...');
  const passP3 = db.recordSwipe('p3', 'pass');
  assert.strictEqual(passP3.match, false);
  const afterPassFeed = db.getFeed();
  assert.strictEqual(afterPassFeed.length, 32);
  assert.ok(!afterPassFeed.map(p => p.id).includes('p3'));
  console.log('   ✓ Pass action recorded, profile removed from feed.');

  // Test 8: Reset restores original state
  console.log('8. Testing Reset restores full deck...');
  db.resetDatabase();
  const resetFeed = db.getFeed();
  assert.strictEqual(resetFeed.length, 35);
  const resetMatches = db.getMatches();
  assert.strictEqual(resetMatches.length, 0);
  console.log('   ✓ Reset successfully restored 35 profiles and 0 matches.');

  console.log('\n🎉 ALL BACKEND & DATABASE TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
