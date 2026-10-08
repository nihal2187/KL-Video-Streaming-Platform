# StreamBox - Video Streaming Platform

> **FSWD Academic Project** — Full Stack Web Development (Frontend)
> Built with HTML5, CSS3, and Vanilla JavaScript (ES6+)

---

## Project Overview

StreamBox is a complete, responsive video streaming platform built as a college FSWD project. It demonstrates core frontend web development concepts including semantic HTML5, responsive CSS3 layouts, and modern JavaScript with localStorage-based persistence.

The platform works entirely in the browser — no server, no backend, no database required.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure, semantic elements, video element |
| CSS3 | Styling, Flexbox, Grid, animations, media queries |
| Vanilla JavaScript (ES6+) | DOM manipulation, localStorage, URL params, Web APIs |
| localStorage | Watchlist, history, likes, user auth (demo) |
| Font Awesome 6 | Icons (loaded from CDN) |

---

## Features

### Core Features
- **Responsive UI** — Works on desktop, tablet, and mobile
- **Dark modern theme** — Professional streaming-platform look
- **Video streaming** — HTML5 `<video>` element with custom controls
- **Real-time search** — Instant filtering across title, description, category
- **Category filtering** — Browse by Movies, Music, Sports, Education, Technology, Gaming, Comedy, Documentary
- **Trending / Popular / Recently Added** sections
- **Smooth animations** — Hover effects, transitions, page loader

### Video Player
- Play / Pause (click or Space)
- Seek bar with click-to-seek
- Volume control + mute toggle (M key)
- Playback speed (0.5× – 2×)
- Fullscreen (F key)
- Picture-in-Picture (browser permitting)
- Keyboard shortcuts: Space=play/pause, F=fullscreen, M=mute, ←→=seek 10s, ↑↓=volume

### User Features
- **Watchlist** — Add/remove videos, persisted in localStorage
- **Watch History** — Auto-saved when a video is opened, with clear option
- **Like System** — Toggle likes, persisted in localStorage
- **Share** — Web Share API or clipboard fallback

### Authentication (Demo Only)
- **Register** — Full name, email, password (stored in localStorage)
- **Login** — Email + password validation against stored account
- **Profile** — View stats, edit display name, see watchlist/history/likes previews
- **Logout** — Clears session from localStorage

---

## Project Structure

```
StreamBox/
│
├── index.html          ← Home page (hero, trending, popular, categories, watchlist, history)
├── style.css           ← All styles (dark theme, responsive, animations)
├── script.js           ← Main JavaScript (all core functions)
├── README.md           ← This file
│
├── pages/
│   ├── login.html      ← Login form with validation
│   ├── register.html   ← Registration form with password strength meter
│   ├── watch.html      ← Video player page (reads ?id= from URL)
│   └── profile.html    ← User profile dashboard
│
├── assets/
│   ├── images/         ← Place your own thumbnail images here
│   ├── videos/         ← Place your own .mp4 video files here
│   └── icons/          ← Place custom icons here if needed
│
└── data/
    └── videos.js       ← All 22 video data objects + helper functions
```

---

## How to Run

### Option 1: VS Code Live Server (Recommended)
1. Open the project folder in VS Code or Kiro IDE
2. Install the **Live Server** extension (by Ritwick Dey)
3. Right-click `index.html` → **"Open with Live Server"**
4. The site opens at `http://127.0.0.1:5500`

### Option 2: Direct File Open
1. Open `index.html` directly in any modern browser (Chrome, Firefox, Edge)
2. Most features work, but some browser security restrictions may affect video playback from certain URLs

### Option 3: Python Local Server
```bash
# In the project directory:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Option 4: Node.js (npx serve)
```bash
npx serve .
# Then visit the URL shown in the terminal
```

---

## Demo Login Credentials

A demo account is auto-created when you first open `login.html`:

| Field | Value |
|---|---|
| Email | `demo@streambox.com` |
| Password | `Demo@1234` |

Or register your own account — it's stored in your browser's localStorage.

---

## Adding Your Own Videos

The demo uses publicly available sample videos. To use your own:

1. Place `.mp4` files in `assets/videos/`
2. Place thumbnail `.jpg`/`.png` files in `assets/images/`
3. Edit `data/videos.js` — update the `videoUrl` and `thumbnail` fields:

```js
{
  id: 23,
  title: "My Video",
  description: "Description here",
  category: "Movies",
  duration: "1:30:00",
  year: 2024,
  rating: 8.5,
  thumbnail: "../assets/images/my-thumbnail.jpg",
  videoUrl: "../assets/videos/my-video.mp4",
  featured: false,
  views: "1.0M"
}
```

---

## FSWD Concepts Demonstrated

### HTML5
- Semantic elements: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<header>`
- `<video>` element with custom controls
- `<form>` with proper labels, fieldsets, aria attributes
- `<input>` types: text, email, password, range, search
- Accessibility: `aria-label`, `aria-live`, `role`, `tabindex`, `alt` text

### CSS3
- CSS Custom Properties (variables) for theming
- **Flexbox** — navbar, cards, form layouts
- **CSS Grid** — video grid, categories grid, profile layout, footer
- **Media queries** — 5 breakpoints (1280px, 1024px, 768px, 480px, 360px)
- Transitions and animations (`@keyframes`)
- `:hover`, `:focus-visible`, `:nth-child` pseudo-classes
- `position: sticky/fixed`, `backdrop-filter`, `clamp()`
- Responsive typography with `clamp()`

### JavaScript (ES6+)
- DOM manipulation (`querySelector`, `createElement`, `appendChild`)
- Events (`addEventListener`, `DOMContentLoaded`, keyboard events)
- Arrays and array methods (`filter`, `map`, `find`, `sort`, `slice`, `includes`)
- Objects and destructuring
- Template literals
- Arrow functions
- `localStorage` CRUD (get, set, remove)
- `URLSearchParams` for reading URL query parameters
- `async/await` (share function, PiP API)
- Web APIs: `navigator.share`, `navigator.clipboard`, `requestFullscreen`, `requestPictureInPicture`
- Form validation (custom, no libraries)
- Dynamic rendering (cards, grids, lists)
- Single-page app view switching pattern

---

## Security Notes

> ⚠️ **IMPORTANT — Read before evaluation**

This project is for **educational/demonstration purposes only**.

- Passwords are stored as **plain text** in `localStorage` — this is NOT acceptable for real applications
- localStorage has **no encryption** — anyone with browser access can read the data
- There is **no server-side validation** — all checks are client-side only
- **Do not use real personal information** in this demo
- Production apps require: server-side auth, hashed passwords (bcrypt), HTTPS, session tokens (JWT/cookies)

This is clearly stated in the UI on all auth pages.

---

## 10 FSWD Viva Questions & Answers

### Q1. What is the difference between `localStorage` and `sessionStorage`?

**A:** Both are Web Storage APIs. `localStorage` persists data even after the browser is closed — data stays until manually cleared. `sessionStorage` only stores data for the duration of the browser tab/session and is cleared when the tab is closed. In StreamBox, I use `localStorage` so the user's watchlist, history, and login state persist across browser sessions.

---

### Q2. How does your search functionality work without a database?

**A:** I use JavaScript's `Array.filter()` method on the `videosData` array loaded in `data/videos.js`. When the user types in the search box, the `input` event fires, calling `performSearch(query)`. This filters videos whose `title`, `description`, or `category` includes the search string (converted to lowercase for case-insensitive matching). The results are then dynamically rendered into the DOM using `renderVideos()`. Everything happens client-side in real time — no server call needed.

---

### Q3. Explain how the HTML5 video player works and what events you use.

**A:** The HTML5 `<video>` element natively handles video decoding and playback. I build a custom controls overlay on top of it using CSS absolute positioning. The key events I use are:
- `timeupdate` — fires repeatedly during playback; I use it to update the progress bar width and time display
- `play` / `pause` — used to toggle the play/pause button icon
- `click` on the progress bar — I calculate the click position as a percentage of the bar width to set `videoEl.currentTime`
- `keydown` on `document` — to handle keyboard shortcuts (Space, F, M, arrow keys)

---

### Q4. What is the DOM and how do you manipulate it in this project?

**A:** The DOM (Document Object Model) is a tree-like representation of an HTML page that JavaScript can read and modify. In StreamBox, I manipulate the DOM extensively — for example, `createVideoCard()` uses `document.createElement('article')` to build a card element, sets its `innerHTML` and `dataset`, attaches event listeners, and returns the element to be `appendChild`-ed into a grid container. I also use `classList.add/remove/toggle` to show/hide views and update button states without reloading the page.

---

### Q5. How does the login/authentication work? Is it secure?

**A:** The authentication is a frontend-only demo. When a user registers, their name, email, and password are saved as a JSON object in `localStorage` under the key `streambox_user`. When they log in, I read that object and compare the entered email and password. If they match, I save a session object `{ name, email }` in `localStorage` under `streambox_session`. Every protected page checks for this session on load.

**No, it is NOT secure** for production. Passwords are plain text, anyone can read localStorage in DevTools, and there's no server-side validation. Real authentication requires HTTPS, server-side password hashing (bcrypt), and token-based sessions (JWT or HTTP-only cookies).

---

### Q6. What is responsive design and how did you implement it?

**A:** Responsive design means the layout adapts to different screen sizes. I implemented it using:
1. **CSS Grid** with `auto-fill` and `minmax()` so video cards automatically adjust columns
2. **CSS media queries** at 1280px, 1024px, 768px, 480px, and 360px breakpoints
3. **Flexbox** for the navbar which collapses the link list on mobile and shows a hamburger button instead
4. **`clamp()`** for responsive font sizes (hero title scales between 2rem and 3.5rem)
5. The `<meta name="viewport">` tag ensures mobile browsers don't zoom out

---

### Q7. What is the difference between Flexbox and CSS Grid? When did you use each?

**A:** Flexbox is one-dimensional — it lays items out in a single row or column. Grid is two-dimensional — it manages both rows and columns simultaneously.

In StreamBox:
- **Flexbox** — navbar items, card metadata row, button groups, form inputs, hero actions (single axis)
- **Grid** — video cards grid (`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`), categories grid, profile layout (sidebar + content), footer columns

I chose Grid for areas where I needed both column and row control, and Flexbox for simpler alignment within components.

---

### Q8. What is `localStorage`? How do you use it for the watchlist?

**A:** `localStorage` is a browser API that lets you store key-value pairs as strings, persisted across browser sessions. I store the watchlist as a JSON array of video IDs. My helper functions are:
```js
// Read
function getWatchlist() { return JSON.parse(localStorage.getItem('streambox_watchlist')) || []; }

// Write
function addToWatchlist(id) {
  const list = getWatchlist();
  if (!list.includes(Number(id))) {
    list.push(Number(id));
    localStorage.setItem('streambox_watchlist', JSON.stringify(list));
  }
}
```
When the user clicks the watchlist button, I call `toggleWatchlist(id)` which either adds or removes that ID, then re-renders the button state.

---

### Q9. How do you read URL parameters and why do you use them for the watch page?

**A:** I use the browser's built-in `URLSearchParams` API:
```js
const params = new URLSearchParams(window.location.search);
const id = params.get('id'); // gets "5" from "watch.html?id=5"
```
I use URL parameters for the watch page because it lets you link directly to any video (e.g., `watch.html?id=5`). The page reads the ID, looks up the video object from `videosData` using `getVideoById(id)`, and populates all the player and info elements. This is a standard web pattern for passing data between pages without a database.

---

### Q10. What are semantic HTML elements? Give examples from your project.

**A:** Semantic elements have meaningful names that describe their purpose to browsers and assistive technologies (screen readers), unlike `<div>` and `<span>` which are generic. Examples from StreamBox:

| Element | Where used |
|---|---|
| `<nav>` | Navigation bar |
| `<main>` | Primary page content |
| `<section>` | Trending, Popular, Hero sections |
| `<article>` | Each video card (`createVideoCard` returns an `<article>`) |
| `<aside>` | Related videos sidebar on watch page |
| `<footer>` | Page footer |
| `<header>` | Page heading areas |
| `<form>` | Login and registration forms |

Semantic HTML improves SEO, accessibility (ARIA roles work better), and code readability.

---

## File Summary

| File | Size | Purpose |
|---|---|---|
| `index.html` | ~200 lines | Home page shell + all view containers |
| `style.css` | ~900 lines | Complete styling + responsive design |
| `script.js` | ~450 lines | All home page JavaScript logic |
| `data/videos.js` | ~230 lines | 22 video objects + helper functions |
| `pages/login.html` | ~160 lines | Login form + inline JS |
| `pages/register.html` | ~200 lines | Register form + strength meter + inline JS |
| `pages/watch.html` | ~350 lines | Video player + controls + inline JS |
| `pages/profile.html` | ~320 lines | Profile dashboard + inline JS |

**Total: ~2,810 lines of code across 8 files**

---

## License

This project is created for educational purposes as part of a Full Stack Web Development college course.
Video content uses publicly available royalty-free samples.
No copyrighted commercial content is included.

---

*StreamBox — FSWD College Project | Built with ❤️ using HTML5, CSS3 & Vanilla JavaScript*
