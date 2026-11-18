# Coy — Swipe-Based Discovery Feature

A standalone mobile-first discovery experience built as a new **Discover** tab alongside Coy's existing experience, featuring intuitive card-swiping physics, instant mutual match celebrations, and strict privacy guarantees.

---

## 🌟 Overview & Highlights

- **Mobile-First Experience**: Designed with an elegant, responsive mobile viewport shell on desktop and full edge-to-edge support on mobile devices.
- **Buttery-Smooth Swipe Physics**:
  - Drag gestures on touch devices and desktop mouse/pointer.
  - Rotational tilt proportional to horizontal drag distance.
  - Dynamic **"LIKE"** (green tilted stamp) and **"NOPE"** (red tilted stamp) badges that fade in smoothly with drag momentum.
  - Stacked preview cards underneath for depth and spatial feedback.
  - Desktop control buttons (Pass ❌, Superlike ⭐, Like 💚, Info ℹ️).
- **Coy Core Privacy Promise**:
  - **Mutual-only visibility**: One-sided likes are strictly confidential and never revealed to the user unless the feeling is mutual.
  - **Zero leak API**: The backend completely strips the `has_liked_user` field from `GET /feed` payloads so curious users inspecting the network tab cannot determine who liked them.
- **Match Celebration**:
  - Instant "It's a Match!" celebration modal with particle confetti shower.
  - Intersecting glowing avatars with pulsing heart animation.
  - Direct actions: **Say Hello** (opens live chat drawer) or **Keep Swiping**.
- **Persistent Matches & Feed**:
  - Swiped profiles **never appear again** in the discovery feed.
  - All swipes and matches persist across browser refreshes via SQLite database.
- **Interactive Matches Tab**:
  - Horizontal carousel of **New Matches**.
  - Conversation list with matched users, college/city, and relative timestamps.
  - Interactive chat drawer with tailored icebreakers and responsive mock conversation.
- **Placeholder Home Tab**:
  - Keeps the "Home" tab blank and focused, as requested.

---

## 🛠️ Tech Stack

- **Frontend**:
  - **React 18** (mobile-first components, hooks, gesture handling)
  - **Lucide React** (feather icons)
  - **Esbuild** (sub-second bundler with sourcemaps)
  - **Custom CSS Design System** (warm Coy brand palette, hardware-accelerated transitions)
- **Backend**:
  - **Node.js (v22)** with **Express**
  - **CORS & JSON body parsing**
- **Data Persistence**:
  - **Native SQLite** (using Node 22's built-in `node:sqlite` DatabaseSync)
  - Resilient JSON fallback mechanism ensuring cross-platform stability
- **Zero External Network Dependencies at Runtime**:
  - Bundled and configured to run self-contained locally.

---

## 📡 Backend APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/feed` (or `/api/feed`) | Returns list of profiles the logged-in user has **not yet swiped on**. Strips all internal like indicators. |
| `POST` | `/swipe` (or `/api/swipe`) | Accepts `{ profileId, action: 'like' \| 'pass' }`. Records swipe; returns `{ match: boolean, profile?: Profile }`. |
| `GET` | `/matches` (or `/api/matches`) | Returns all mutual matches for the user, ordered by match timestamp. |
| `POST` | `/reset` (or `/api/reset`) | Reseeds database with 35 fresh profiles and clears all swipes/matches for demo re-testing. |
| `GET` | `/health` & `/stats` | Healthcheck and real-time statistics (total profiles, swiped, matches). |

---

## 👥 Seed Data (35 Rich Mock Profiles)

The database comes pre-seeded with **35 diverse, high-quality mock profiles** spanning various universities, cities, careers, bios, and interest tags (e.g., Columbia, Stanford, UC Berkeley, NYU, MIT, Harvard, Austin, SF, Seattle).

### Seeded Matches for Demo

To facilitate realistic live evaluation, **10 profiles** have already "liked" the logged-in demo user (`Alex, 24`):

- **Profile #2**: Maya, 22 (Stanford University) — *Swiping Right triggers an instant match!*
- **Profile #5**: Lucas, 26 (UC Berkeley) — *Swiping Right triggers an instant match!*
- **Profile #7**: Julian, 24 (Austin, TX) — *Swiping Right triggers an instant match!*
- **Profile #8**: Zara, 22 (Harvard University) — *Swiping Right triggers an instant match!*
- **Profile #11**: Mateo, 23 (Los Angeles, CA) — *Swiping Right triggers an instant match!*
- **Profile #14**: Isabella, 23 (Juilliard School) — *Swiping Right triggers an instant match!*
- **Profile #16**: Amara, 22 (Parsons School of Design) — *Swiping Right triggers an instant match!*
- **Profile #18**: Freya, 24 (Boston, MA) — *Swiping Right triggers an instant match!*
- **Profile #21**: Ethan, 24 (USC Cinema) — *Swiping Right triggers an instant match!*
- **Profile #24**: Tara, 22 (RISD) — *Swiping Right triggers an instant match!*

*Non-mutual likes (e.g. swiping right on Chloe #1 or Liam #3) record the like silently without revealing anything, preserving Coy's privacy promise.*

---

## 🚀 Getting Started

### 1. Build the Frontend

```bash
npm run build
```

This compiles React JSX and styles into `frontend/dist/bundle.js` and `frontend/dist/bundle.css`.

### 2. Start the App

You can start the full stack in one command:

```bash
npm run dev
```

Or start the backend server (which also serves the compiled frontend):

```bash
npm start
```

Open your browser to:
- **Frontend App**: `http://localhost:3000` (or `http://localhost:5000`)
- **Backend API**: `http://localhost:5000/feed`

---

## 🧪 Testing

Run the automated test suite verifying database logic, API responses, feed exclusions, and privacy guarantees:

```bash
npm test
```

Or run the Express integration test:

```bash
npm run test:integration
```

All tests execute in-process with zero network overhead.

---

## 📂 Project Architecture

```
Coy/
├── backend/
│   ├── data/                 # SQLite database (coy.db)
│   ├── src/
│   │   ├── db.js             # SQLite / JSON DAO layer & privacy sanitizer
│   │   ├── mockProfiles.js   # 35 rich seed profiles with pre-seeded likes
│   │   └── server.js         # Express server (/feed, /swipe, /matches, /reset)
│   ├── test/
│   │   └── api.test.js       # Backend unit test suite
│   └── package.json
├── frontend/
│   ├── build.js              # Esbuild compilation script
│   ├── dev-server.js         # Lightweight local dev server & API proxy
│   ├── dist/                 # Production-ready bundle & index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopNav.jsx        # Coy logo, user status, demo reset button
│   │   │   ├── TabBar.jsx        # Home, Discover, Matches bottom tabs
│   │   │   ├── DiscoverTab.jsx   # Card deck, stack management, action buttons
│   │   │   ├── SwipeCard.jsx     # Gesture engine, stamps, tilt rotation
│   │   │   ├── MatchModal.jsx    # Celebration popup with confetti canvas
│   │   │   ├── MatchesTab.jsx    # Mutual matches list & new match avatars
│   │   │   ├── ChatModal.jsx     # Interactive mock messaging drawer
│   │   │   ├── HomeTab.jsx       # Blank placeholder tab
│   │   │   ├── EmptyState.jsx    # Radar animation when deck is finished
│   │   │   └── InfoDrawer.jsx    # Expandable bio & interest tags drawer
│   │   ├── styles/
│   │   │   └── main.css          # Mobile-first stylesheet & animations
│   │   ├── App.jsx               # Root application state & API coordinator
│   │   └── main.jsx              # React DOM mounting
│   └── package.json
├── dev.js                    # Cross-platform runner for backend + frontend
├── test-inprocess.js         # Integration test verifying full HTTP workflow
├── package.json              # Root workspace package scripts
└── README.md                 # Complete documentation
```

---

## 📱 User Walkthrough

1. **Launch App**: Open the app at `http://localhost:3000`. You land directly in the **Discover** tab with your deck loaded.
2. **Swipe on Profiles**:
   - Swipe right or tap 💚 to **Like**.
   - Swipe left or tap ❌ to **Pass**.
   - Watch the stamp badges illuminate with opacity proportional to your drag distance.
3. **Trigger a Match**:
   - Profile #2 (Maya) has pre-liked you. Swiping right triggers the vibrant **"It's a Match!"** screen with confetti!
4. **Chat with Match**:
   - Tap **"Say Hello to Maya"** to open the chat window, or tap **"Keep Swiping"** to continue through the deck.
5. **View Matches Tab**:
   - Switch to the **Matches** tab to see Maya and any other mutual matches listed with timestamps.
6. **Deck Exhaustion & Reset**:
   - When all 35 profiles have been swiped, the radar **Empty State** appears.
   - Tap **"Reset Demo Deck"** at any time to reseed the database and test again.
