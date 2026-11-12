
/* ============================================================
   KL Video Streaming Platform — Express Backend
   Vercel + Localhost Compatible
   ============================================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = Boolean(process.env.VERCEL);

// File paths
const PUBLIC_DIR = path.join(__dirname, 'public');
const VIDEOS_FILE = path.join(__dirname, 'data', 'videos.json');

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json());

// Make the stylesheet available from the site root on Vercel as well as locally.
// The explicit route also ensures the response is served as CSS by Express.
app.get('/style.css', (req, res, next) => {
    res.sendFile(path.join(PUBLIC_DIR, 'style.css'), error => {
        if (error) next(error);
    });
});

// Serve frontend files from public folder
app.use(express.static(PUBLIC_DIR));

// ============================================================
// VIDEO STORAGE
// Localhost: data/videos.json
// Vercel: temporary in-memory storage
// ============================================================

let videoStore = [];

function loadInitialVideos() {
    try {
        const raw = fs.readFileSync(VIDEOS_FILE, 'utf8');
        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Could not load videos.json:', error.message);
        return [];
    }
}

// Load initial video data
videoStore = loadInitialVideos();

function readVideos() {
    if (IS_VERCEL) {
        return videoStore;
    }

    try {
        const raw = fs.readFileSync(VIDEOS_FILE, 'utf8');
        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return videoStore;
    }
}

function writeVideos(arr) {
    videoStore = arr;

    // Permanent JSON file writes only on localhost
    if (!IS_VERCEL) {
        try {
            fs.mkdirSync(path.dirname(VIDEOS_FILE), {
                recursive: true
            });

            fs.writeFileSync(
                VIDEOS_FILE,
                JSON.stringify(arr, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Video storage error:', error.message);
            throw error;
        }
    }
}

function nextId(arr) {
    if (arr.length === 0) return 1;

    return Math.max(
        ...arr.map(video => Number(video.id) || 0)
    ) + 1;
}

// ============================================================
// GET ALL VIDEOS
// GET /api/videos
// ============================================================

app.get('/api/videos', (req, res) => {
    res.json(readVideos());
});

// ============================================================
// GET SINGLE VIDEO
// GET /api/videos/:id
// ============================================================

app.get('/api/videos/:id', (req, res) => {
    const videos = readVideos();
    const id = parseInt(req.params.id, 10);

    const video = videos.find(v => Number(v.id) === id);

    if (!video) {
        return res.status(404).json({
            error: `Video with id ${id} not found.`
        });
    }

    res.json(video);
});

// ============================================================
// ADD VIDEO
// POST /api/videos
// ============================================================

app.post('/api/videos', (req, res) => {
    const videos = readVideos();
    const body = req.body || {};

    if (typeof body.title !== 'string' || !body.title.trim()) {
        return res.status(400).json({
            error: 'title is required.'
        });
    }

    if (typeof body.videoUrl !== 'string' || !body.videoUrl.trim()) {
        return res.status(400).json({
            error: 'videoUrl is required.'
        });
    }

    if (typeof body.category !== 'string' || !body.category.trim()) {
        return res.status(400).json({
            error: 'category is required.'
        });
    }

    // Only one featured video
    if (body.featured) {
        videos.forEach(v => {
            v.featured = false;
        });
    }

    const newVideo = {
        id: nextId(videos),
        title: body.title.trim(),
        description: String(body.description || '').trim(),
        category: body.category.trim(),
        duration: String(body.duration || '0:00').trim(),
        durationSeconds: parseInt(body.durationSeconds, 10) || 0,
        year: parseInt(body.year, 10) || new Date().getFullYear(),
        rating: Math.min(10, Math.max(0, parseFloat(body.rating) || 7)),
        thumbnail: String(body.thumbnail || '').trim(),
        videoUrl: body.videoUrl.trim(),
        featured: Boolean(body.featured),
        views: String(body.views || '0')
    };

    videos.push(newVideo);
    writeVideos(videos);

    console.log('[API] Video added:', newVideo.title);

    res.status(201).json(newVideo);
});

// ============================================================
// UPDATE VIDEO
// PUT /api/videos/:id
// ============================================================

app.put('/api/videos/:id', (req, res) => {
    const videos = readVideos();
    const id = parseInt(req.params.id, 10);

    const index = videos.findIndex(v => Number(v.id) === id);

    if (index === -1) {
        return res.status(404).json({
            error: `Video with id ${id} not found.`
        });
    }

    const body = req.body || {};

    if (body.featured) {
        videos.forEach(v => {
            v.featured = false;
        });
    }

    const oldVideo = videos[index];

    videos[index] = {
        ...oldVideo,

        ...(body.title !== undefined && {
            title: String(body.title).trim()
        }),

        ...(body.description !== undefined && {
            description: String(body.description).trim()
        }),

        ...(body.category !== undefined && {
            category: String(body.category).trim()
        }),

        ...(body.duration !== undefined && {
            duration: String(body.duration).trim()
        }),

        ...(body.durationSeconds !== undefined && {
            durationSeconds: parseInt(body.durationSeconds, 10) || 0
        }),

        ...(body.year !== undefined && {
            year: parseInt(body.year, 10) || oldVideo.year
        }),

        ...(body.rating !== undefined && {
            rating: Math.min(10, Math.max(0, parseFloat(body.rating) || 7))
        }),

        ...(body.thumbnail !== undefined && {
            thumbnail: String(body.thumbnail).trim()
        }),

        ...(body.videoUrl !== undefined && {
            videoUrl: String(body.videoUrl).trim()
        }),

        ...(body.featured !== undefined && {
            featured: Boolean(body.featured)
        }),

        ...(body.views !== undefined && {
            views: String(body.views)
        }),

        id: oldVideo.id
    };

    writeVideos(videos);

    console.log('[API] Video updated:', id);

    res.json(videos[index]);
});

// ============================================================
// DELETE VIDEO
// DELETE /api/videos/:id
// ============================================================

app.delete('/api/videos/:id', (req, res) => {
    const videos = readVideos();
    const id = parseInt(req.params.id, 10);

    const filtered = videos.filter(v => Number(v.id) !== id);

    if (filtered.length === videos.length) {
        return res.status(404).json({
            error: `Video with id ${id} not found.`
        });
    }

    writeVideos(filtered);

    console.log('[API] Video deleted:', id);

    res.json({
        success: true,
        deletedId: id
    });
});

// ============================================================
// API NOT FOUND
// ============================================================

app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API route not found.'
    });
});

// ============================================================
// HOME PAGE
// Static middleware serves existing HTML pages.
// ============================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: 'Internal server error.'
    });
});

// ============================================================
// EXPORT FOR VERCEL
// ============================================================

module.exports = app;

// ============================================================
// LOCALHOST SERVER
// ============================================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('');
        console.log('==========================================');
        console.log(' KL Video Streaming Platform');
        console.log(' Server Running Successfully!');
        console.log('==========================================');
        console.log(` Website : http://localhost:${PORT}`);
        console.log(` Admin   : http://localhost:${PORT}/pages/admin/login.html`);
        console.log(` API     : http://localhost:${PORT}/api/videos`);
        console.log('==========================================');
        console.log('');
    });
}
