/* ============================================================
   KL Video Streaming Platform — Express Backend
   ============================================================
   Responsibilities:
   1. Serve all existing frontend static files (HTML/CSS/JS).
   2. Provide a REST API for video management:
        GET    /api/videos          → list all videos
        POST   /api/videos          → add a video
        PUT    /api/videos/:id      → update a video
        DELETE /api/videos/:id      → delete a video
        GET    /api/videos/:id      → get one video
   3. Persist videos to  data/videos.json  (plain JSON file).
      No database required — easy for college viva demos.

   Authentication (Signup/Login) stays in the browser with
   localStorage as required by the SDC project specification.
   The server does NOT handle auth.

   Run:
     npm install
     npm start
   Open: http://localhost:3000
   ============================================================ */

const express  = require('express');
const fs       = require('fs');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Path to the JSON file that stores all videos ──────────
const VIDEOS_FILE = path.join(__dirname, 'data', 'videos.json');

/* ──────────────────────────────────────────────────────────
   MIDDLEWARE
────────────────────────────────────────────────────────── */

// Parse JSON request bodies
app.use(express.json());

// Serve the entire project folder as static files.
// This makes index.html, style.css, script.js, pages/*, etc.
// all accessible directly at http://localhost:3000/
app.use(express.static(path.join(__dirname)));

/* ──────────────────────────────────────────────────────────
   FILE HELPERS
   Read and write data/videos.json
────────────────────────────────────────────────────────── */

/**
 * readVideos()
 * Reads data/videos.json and returns the array.
 * Returns [] if the file is empty or unreadable.
 */
function readVideos() {
  try {
    const raw = fs.readFileSync(VIDEOS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // File missing or corrupted — start fresh
    return [];
  }
}

/**
 * writeVideos(arr)
 * Writes the array to data/videos.json with pretty formatting.
 */
function writeVideos(arr) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

/**
 * nextId(arr)
 * Returns max existing id + 1. Guarantees unique IDs even
 * after deletions.
 */
function nextId(arr) {
  if (arr.length === 0) return 1;
  return Math.max(...arr.map(v => Number(v.id) || 0)) + 1;
}

/* ──────────────────────────────────────────────────────────
   API ROUTES
────────────────────────────────────────────────────────── */

// ── GET /api/videos ──────────────────────────────────────
// Returns the full video list.
// The frontend (script.js and admin pages) call this on load
// to sync their local state with the server data.
app.get('/api/videos', (req, res) => {
  const videos = readVideos();
  res.json(videos);
});

// ── GET /api/videos/:id ──────────────────────────────────
// Returns a single video by ID. Used by watch.html.
app.get('/api/videos/:id', (req, res) => {
  const videos = readVideos();
  const video  = videos.find(v => v.id === parseInt(req.params.id));
  if (!video) {
    return res.status(404).json({ error: `Video with id ${req.params.id} not found.` });
  }
  res.json(video);
});

// ── POST /api/videos ─────────────────────────────────────
// Adds a new video. Called by Admin "Add Video" form.
// Body: { title, description, category, duration, year,
//         rating, thumbnail, videoUrl, featured }
app.post('/api/videos', (req, res) => {
  const videos = readVideos();
  const body   = req.body;

  // Basic validation
  if (!body.title || !body.title.trim()) {
    return res.status(400).json({ error: 'title is required.' });
  }
  if (!body.videoUrl || !body.videoUrl.trim()) {
    return res.status(400).json({ error: 'videoUrl is required.' });
  }
  if (!body.category) {
    return res.status(400).json({ error: 'category is required.' });
  }

  // If this video is being set as featured, unset all others
  if (body.featured) {
    videos.forEach(v => { v.featured = false; });
  }

  const newVideo = {
    id          : nextId(videos),
    title       : String(body.title).trim(),
    description : String(body.description || '').trim(),
    category    : String(body.category).trim(),
    duration    : String(body.duration || '0:00').trim(),
    durationSeconds: parseInt(body.durationSeconds) || 0,
    year        : parseInt(body.year)   || new Date().getFullYear(),
    rating      : Math.min(10, Math.max(0, parseFloat(body.rating) || 7.0)),
    thumbnail   : String(body.thumbnail || '').trim(),
    videoUrl    : String(body.videoUrl).trim(),
    featured    : Boolean(body.featured),
    views       : String(body.views || '0'),
  };

  videos.push(newVideo);
  writeVideos(videos);

  console.log(`[API] Video added: "${newVideo.title}" (id=${newVideo.id})`);
  res.status(201).json(newVideo);
});

// ── PUT /api/videos/:id ──────────────────────────────────
// Updates an existing video. Called by Admin "Edit Video".
// Body: same fields as POST, only changed fields needed.
app.put('/api/videos/:id', (req, res) => {
  const videos = readVideos();
  const id     = parseInt(req.params.id);
  const idx    = videos.findIndex(v => v.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: `Video with id ${id} not found.` });
  }

  const body = req.body;

  // If this video is being set as featured, unset all others first
  if (body.featured) {
    videos.forEach(v => { v.featured = false; });
  }

  // Merge updates — keep existing fields if not provided
  videos[idx] = {
    ...videos[idx],
    ...(body.title       !== undefined && { title       : String(body.title).trim() }),
    ...(body.description !== undefined && { description : String(body.description).trim() }),
    ...(body.category    !== undefined && { category    : String(body.category).trim() }),
    ...(body.duration    !== undefined && { duration    : String(body.duration).trim() }),
    ...(body.durationSeconds !== undefined && { durationSeconds: parseInt(body.durationSeconds) || 0 }),
    ...(body.year        !== undefined && { year        : parseInt(body.year) || videos[idx].year }),
    ...(body.rating      !== undefined && { rating      : Math.min(10, Math.max(0, parseFloat(body.rating) || 7.0)) }),
    ...(body.thumbnail   !== undefined && { thumbnail   : String(body.thumbnail).trim() }),
    ...(body.videoUrl    !== undefined && { videoUrl    : String(body.videoUrl).trim() }),
    ...(body.featured    !== undefined && { featured    : Boolean(body.featured) }),
    ...(body.views       !== undefined && { views       : String(body.views) }),
    id,   // ID is immutable
  };

  writeVideos(videos);
  console.log(`[API] Video updated: "${videos[idx].title}" (id=${id})`);
  res.json(videos[idx]);
});

// ── DELETE /api/videos/:id ───────────────────────────────
// Deletes a video. Called by Admin "Delete Video".
app.delete('/api/videos/:id', (req, res) => {
  const videos  = readVideos();
  const id      = parseInt(req.params.id);
  const filtered = videos.filter(v => v.id !== id);

  if (filtered.length === videos.length) {
    return res.status(404).json({ error: `Video with id ${id} not found.` });
  }

  writeVideos(filtered);
  console.log(`[API] Video deleted: id=${id}`);
  res.json({ success: true, deletedId: id });
});

/* ──────────────────────────────────────────────────────────
   CATCH-ALL — SPA fallback
   Serves index.html for any route not matched above so
   that direct URL navigation works correctly.
────────────────────────────────────────────────────────── */
app.get('*', (req, res) => {
  // Only send index.html for non-API, non-file requests
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ──────────────────────────────────────────────────────────
   START SERVER
────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   KL Video Streaming Platform — Server Running   ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║   URL    :  http://localhost:${PORT}                  ║`);
  console.log(`║   Admin  :  http://localhost:${PORT}/pages/admin/login.html ║`);
  console.log(`║   API    :  http://localhost:${PORT}/api/videos        ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
