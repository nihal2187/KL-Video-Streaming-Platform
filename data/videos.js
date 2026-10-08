/* ============================================================
   KL Video Streaming Platform — Central Video Data Store
   ============================================================

   VIDEO FLOW WITH THE EXPRESS BACKEND:
   ─────────────────────────────────────
   SERVER (data/videos.json)
       ↕  REST API  (/api/videos)
   BROWSER (localStorage "kl_videos")
       ↕  getVideos()
   UI (script.js, admin pages)

   On every page load, script.js calls klVideoAPI.sync() which
   fetches GET /api/videos and writes the result into
   localStorage "kl_videos".  All existing getVideos() calls
   then read from that cache — zero changes required to
   script.js rendering code.

   Admin CRUD (adminAddVideo / adminUpdateVideo / adminDeleteVideo)
   now call the API first, then update localStorage so the UI
   refreshes immediately without a round-trip page reload.

   FALLBACK:  If the server is not running (e.g. opened via
   file:// or Live Server), all functions fall back to
   localStorage-only mode exactly as before.  The app is
   fully usable without the backend.

   Auth (Signup/Login) intentionally stays in localStorage —
   required by the SDC project specification.
   ============================================================ */

// ── Valid categories ──────────────────────────────────────
const KL_CATEGORIES = [
  'Movies', 'Series', 'Action', 'Comedy', 'Drama',
  'Animation', 'Documentary', 'Sports', 'Technology', 'Music',
];

/* ──────────────────────────────────────────────────────────
   API HELPER
   Detects whether we are running under Express (served from
   http://localhost:…) or directly from the filesystem.
────────────────────────────────────────────────────────── */
const klVideoAPI = (() => {
  // Are we being served by Express?
  const isExpressServed = (
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1')
  );

  /** Base URL for the API — empty string when served from root */
  const BASE = '';   // /api/videos works both from root and sub-pages

  /**
   * sync()
   * Fetches all videos from GET /api/videos and writes them
   * into localStorage "kl_videos".
   * Called once on every page load by script.js bootstrap.
   * Returns the videos array (or [] on error).
   */
  async function sync() {
    if (!isExpressServed) return getVideosFromLS();
    try {
      const res  = await fetch(`${BASE}/api/videos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      saveVideosToLS(data);
      videosData = data;
      return data;
    } catch (err) {
      console.warn('[KL Video] API sync failed — using localStorage fallback.', err.message);
      return getVideosFromLS();
    }
  }

  /** POST /api/videos — add a new video */
  async function addVideo(videoObj) {
    if (!isExpressServed) return null;   // caller uses LS fallback
    const res = await fetch(`${BASE}/api/videos`, {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify(videoObj),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const saved = await res.json();
    await sync();   // refresh localStorage cache
    return saved;
  }

  /** PUT /api/videos/:id — update an existing video */
  async function updateVideo(id, updates) {
    if (!isExpressServed) return false;
    const res = await fetch(`${BASE}/api/videos/${id}`, {
      method  : 'PUT',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    await sync();
    return true;
  }

  /** DELETE /api/videos/:id — delete a video */
  async function deleteVideo(id) {
    if (!isExpressServed) return false;
    const res = await fetch(`${BASE}/api/videos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    await sync();
    return true;
  }

  return { isExpressServed, sync, addVideo, updateVideo, deleteVideo };
})();

/* ──────────────────────────────────────────────────────────
   localStorage HELPERS  (internal use only)
────────────────────────────────────────────────────────── */

/** Read raw videos array from localStorage */
function getVideosFromLS() {
  try {
    const raw = localStorage.getItem('kl_videos');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { /* corrupted */ }
  return [];
}

/** Write videos array to localStorage */
function saveVideosToLS(arr) {
  try {
    localStorage.setItem('kl_videos', JSON.stringify(arr));
  } catch (e) { /* quota exceeded — ignore */ }
}

/* ──────────────────────────────────────────────────────────
   PUBLIC VIDEO STORE API
   These functions are called by script.js and all pages.
   They read from the localStorage cache that sync() keeps
   fresh.  This means zero changes to rendering code.
────────────────────────────────────────────────────────── */

/**
 * getVideos()
 * Returns the current video list from localStorage cache.
 * The cache is kept in sync with the server by sync().
 */
function getVideos() {
  return getVideosFromLS();
}

/** Kept for backwards-compatibility with any direct saveVideos() calls */
function saveVideos(arr) {
  saveVideosToLS(arr);
  videosData = arr;
}

/** Live reference so legacy code reading `videosData` still works */
let videosData = getVideos();

/* ──────────────────────────────────────────────────────────
   USER-FACING QUERY HELPERS
────────────────────────────────────────────────────────── */

function getAllCategories() {
  const cats = getVideos().map(v => v.category);
  return ['All', ...new Set(cats)];
}

function getVideoById(id) {
  return getVideos().find(v => v.id === parseInt(id));
}

function getVideosByCategory(category) {
  if (!category || category === 'All') return getVideos();
  return getVideos().filter(v => v.category === category);
}

function getFeaturedVideo() {
  const videos = getVideos();
  if (videos.length === 0) return null;
  return (
    videos.find(v => v.featured) ||
    [...videos].sort((a, b) => b.rating - a.rating)[0]
  );
}

function getRelatedVideos(id, category, limit = 6) {
  return getVideos()
    .filter(v => v.id !== parseInt(id) && v.category === category)
    .slice(0, limit);
}

/* ──────────────────────────────────────────────────────────
   ADMIN CRUD FUNCTIONS
   Called from pages/admin/videos.html.
   These are now ASYNC — they call the API when Express is
   running, then sync localStorage so the UI updates
   immediately.  When there's no server (localStorage-only
   mode), they fall back to direct localStorage writes.
────────────────────────────────────────────────────────── */

/**
 * adminAddVideo(videoObj)
 * Adds a video.  Returns the saved video object (with id).
 *
 * Usage (admin page):
 *   const saved = await adminAddVideo({ title, category, … });
 */
async function adminAddVideo(videoObj) {
  // ── API path ──────────────────────────────────────────
  if (klVideoAPI.isExpressServed) {
    return await klVideoAPI.addVideo(videoObj);
  }

  // ── localStorage fallback ─────────────────────────────
  const videos = getVideos();
  const maxId  = videos.reduce((m, v) => Math.max(m, v.id), 0);
  if (videoObj.featured) videos.forEach(v => { v.featured = false; });
  const newVideo = {
    id           : maxId + 1,
    title        : String(videoObj.title        || 'Untitled').trim(),
    description  : String(videoObj.description  || '').trim(),
    category     : String(videoObj.category     || 'Movies').trim(),
    duration     : String(videoObj.duration     || '0:00').trim(),
    durationSeconds: parseInt(videoObj.durationSeconds) || 0,
    year         : parseInt(videoObj.year)       || new Date().getFullYear(),
    rating       : Math.min(10, Math.max(0, parseFloat(videoObj.rating) || 7.0)),
    thumbnail    : String(videoObj.thumbnail     || '').trim(),
    videoUrl     : String(videoObj.videoUrl      || '').trim(),
    featured     : Boolean(videoObj.featured),
    views        : String(videoObj.views || '0'),
  };
  videos.push(newVideo);
  saveVideos(videos);
  return newVideo;
}

/**
 * adminUpdateVideo(id, updates)
 * Updates a video.  Returns true on success.
 *
 * Usage (admin page):
 *   await adminUpdateVideo(5, { title: 'New Title', rating: 9 });
 */
async function adminUpdateVideo(id, updates) {
  if (klVideoAPI.isExpressServed) {
    return await klVideoAPI.updateVideo(id, updates);
  }

  // localStorage fallback
  const videos = getVideos();
  const idx    = videos.findIndex(v => v.id === parseInt(id));
  if (idx === -1) return false;
  if (updates.featured) videos.forEach(v => { v.featured = false; });
  videos[idx] = {
    ...videos[idx],
    ...updates,
    id: parseInt(id),
    rating: Math.min(10, Math.max(0, parseFloat(updates.rating ?? videos[idx].rating) || 7.0)),
  };
  saveVideos(videos);
  return true;
}

/**
 * adminDeleteVideo(id)
 * Deletes a video.  Returns true on success.
 *
 * Usage (admin page):
 *   await adminDeleteVideo(5);
 */
async function adminDeleteVideo(id) {
  if (klVideoAPI.isExpressServed) {
    return await klVideoAPI.deleteVideo(id);
  }

  // localStorage fallback
  const videos   = getVideos();
  const filtered = videos.filter(v => v.id !== parseInt(id));
  if (filtered.length === videos.length) return false;
  saveVideos(filtered);
  return true;
}

/* ──────────────────────────────────────────────────────────
   ADMIN UTILITY FUNCTIONS
   (Used by Admin Dashboard)
────────────────────────────────────────────────────────── */

/**
 * adminLoadDemoVideos()
 * Intentional admin action — loads 3 open-license Blender
 * Foundation films via the API (or localStorage if no server).
 * Only runs when the admin explicitly clicks the button.
 */
const KL_DEMO_VIDEOS = [
  {
    title: 'Big Buck Bunny',
    description: 'A classic open-source animated short film by the Blender Foundation.',
    category: 'Animation', duration: '9:56', durationSeconds: 596,
    year: 2008, rating: 8.2,
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    featured: true, views: '0',
  },
  {
    title: 'Elephant Dream',
    description: 'The world\'s first open movie, made entirely with Blender.',
    category: 'Animation', duration: '10:54', durationSeconds: 654,
    year: 2006, rating: 7.8,
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    featured: false, views: '0',
  },
  {
    title: 'Tears of Steel',
    description: 'A sci-fi short by the Blender Foundation — scientists fight in a dystopian future.',
    category: 'Movies', duration: '12:14', durationSeconds: 734,
    year: 2012, rating: 8.5,
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    featured: false, views: '0',
  },
];

async function adminLoadDemoVideos() {
  if (getVideos().length > 0) {
    return { added: 0, message: 'Videos already exist. Clear first to reload demo videos.' };
  }
  let added = 0;
  for (const v of KL_DEMO_VIDEOS) {
    await adminAddVideo(v);
    added++;
  }
  return { added, message: `${added} demo videos loaded.` };
}

/** adminClearAllVideos() — wipes all videos (admin-only action) */
async function adminClearAllVideos() {
  if (klVideoAPI.isExpressServed) {
    // Delete all via API one by one
    const videos = getVideos();
    for (const v of videos) {
      await klVideoAPI.deleteVideo(v.id).catch(() => {});
    }
    await klVideoAPI.sync();
  } else {
    localStorage.removeItem('kl_videos');
    videosData = [];
  }
}

/* ──────────────────────────────────────────────────────────
   PER-USER DATA HELPERS
   Watchlist, History, Likes stay in localStorage keyed by
   user email — exactly as before.  Unchanged.
────────────────────────────────────────────────────────── */

function getUserDataKey(baseKey, email) {
  return `${baseKey}_${(email || 'guest').toLowerCase().trim()}`;
}

function getUserWatchlist(email) {
  try { return JSON.parse(localStorage.getItem(getUserDataKey('kl_watchlist', email))) || []; }
  catch { return []; }
}
function saveUserWatchlist(email, list) {
  localStorage.setItem(getUserDataKey('kl_watchlist', email), JSON.stringify(list));
}

function getUserHistory(email) {
  try { return JSON.parse(localStorage.getItem(getUserDataKey('kl_history', email))) || []; }
  catch { return []; }
}
function saveUserHistory(email, history) {
  localStorage.setItem(getUserDataKey('kl_history', email), JSON.stringify(history));
}

function getUserLikes(email) {
  try { return JSON.parse(localStorage.getItem(getUserDataKey('kl_likes', email))) || []; }
  catch { return []; }
}
function saveUserLikes(email, likes) {
  localStorage.setItem(getUserDataKey('kl_likes', email), JSON.stringify(likes));
}

/* ──────────────────────────────────────────────────────────
   RECOMMENDATION ENGINE  (unchanged)
────────────────────────────────────────────────────────── */

function getRecommendations(email, limit = 8) {
  const allVideos = getVideos();
  if (allVideos.length === 0) return [];
  if (!email) return [...allVideos].sort((a, b) => b.rating - a.rating).slice(0, limit);

  const history    = getUserHistory(email).map(h => h.id);
  const watchlist  = getUserWatchlist(email);
  const interacted = [...new Set([...history, ...watchlist])];

  const catCount = {};
  interacted.forEach(id => {
    const v = getVideoById(id);
    if (v) catCount[v.category] = (catCount[v.category] || 0) + 1;
  });

  const topCats = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);

  if (topCats.length === 0) {
    return allVideos
      .filter(v => !interacted.includes(v.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  const recs   = [];
  const recIds = new Set();

  for (const cat of topCats) {
    allVideos
      .filter(v => v.category === cat && !interacted.includes(v.id) && !recIds.has(v.id))
      .forEach(v => { recs.push(v); recIds.add(v.id); });
    if (recs.length >= limit) break;
  }

  if (recs.length < limit) {
    allVideos
      .filter(v => !interacted.includes(v.id) && !recIds.has(v.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit - recs.length)
      .forEach(v => recs.push(v));
  }

  return recs.slice(0, limit);
}
