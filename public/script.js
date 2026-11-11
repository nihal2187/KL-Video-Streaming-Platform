/* ============================================================
   KL Video Streaming Platform — Main JavaScript
   ============================================================

   Main user-module functionality:
   - Navigation
   - Search
   - Category filtering
   - Watchlist
   - History
   - Likes
   - Login / Logout
   - Hero section
   - Video cards
   - Recommendations

   IMPORTANT:
   Videos are loaded from the Express backend FIRST.
   Then the homepage is rendered.
   ============================================================ */


/* ─────────────────────────────────────────
   1. localStorage KEYS
───────────────────────────────────────── */

const LS = {
  USER: 'kl_user',
  SESSION: 'kl_session'
};


/* ─────────────────────────────────────────
   2. localStorage HELPERS
───────────────────────────────────────── */

function lsGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function lsGetObj(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
}


/* Build per-user storage key */

function getUserKey(base) {
  const session = lsGetObj(LS.SESSION);

  const email = session
    ? session.email.toLowerCase().trim()
    : 'guest';

  return `${base}_${email}`;
}


/* ─────────────────────────────────────────
   3. DOM REFERENCES
───────────────────────────────────────── */

const navbar            = document.getElementById('navbar');
const hamburgerBtn      = document.getElementById('hamburgerBtn');
const mobileNav         = document.getElementById('mobileNav');
const searchToggleBtn   = document.getElementById('searchToggleBtn');
const searchBox         = document.getElementById('searchBox');
const searchInput       = document.getElementById('searchInput');
const searchClearBtn    = document.getElementById('searchClearBtn');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const toastContainer    = document.getElementById('toastContainer');
const pageLoader        = document.getElementById('page-loader');


/* Auth */

const authButtons     = document.getElementById('authButtons');
const userMenu        = document.getElementById('userMenu');
const userAvatarBtn   = document.getElementById('userAvatarBtn');
const userAvatarInit  = document.getElementById('userAvatarInitial');
const userDropdown    = document.getElementById('userDropdown');
const dropdownName    = document.getElementById('dropdownUserName');
const dropdownEmail   = document.getElementById('dropdownUserEmail');
const logoutBtn       = document.getElementById('logoutBtn');
const mobileAuthBtns  = document.getElementById('mobileAuthButtons');
const mobileUserInfo  = document.getElementById('mobileUserInfo');
const mobileUserName  = document.getElementById('mobileUserName');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');


/* Views */

const homeView      = document.getElementById('homeView');
const browseView    = document.getElementById('browseView');
const searchView    = document.getElementById('searchView');
const watchlistView = document.getElementById('watchlistView');
const historyView   = document.getElementById('historyView');


/* Home */

const trendingGrid       = document.getElementById('trendingGrid');
const popularGrid        = document.getElementById('popularGrid');
const recentGrid         = document.getElementById('recentGrid');
const recommendedGrid    = document.getElementById('recommendedGrid');
const recommendedSection = document.getElementById('recommendedSection');
const categoriesGrid     = document.getElementById('categoriesGrid');


/* Browse */

const browseTitle       = document.getElementById('browseTitle');
const browseSubtitle    = document.getElementById('browseSubtitle');
const categoryFilterBar = document.getElementById('categoryFilterBar');
const browseGrid        = document.getElementById('browseGrid');


/* Search */

const searchGrid       = document.getElementById('searchGrid');
const noResults        = document.getElementById('noResults');
const searchQueryLabel = document.getElementById('searchQueryLabel');


/* Watchlist */

const watchlistGrid     = document.getElementById('watchlistGrid');
const watchlistEmpty    = document.getElementById('watchlistEmpty');
const clearWatchlistBtn = document.getElementById('clearWatchlistBtn');


/* History */

const historyGrid     = document.getElementById('historyGrid');
const historyEmpty    = document.getElementById('historyEmpty');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');


/* Hero */

const heroBg           = document.getElementById('heroBg');
const heroTitle        = document.getElementById('heroTitle');
const heroRating       = document.getElementById('heroRating');
const heroDuration     = document.getElementById('heroDuration');
const heroYear         = document.getElementById('heroYear');
const heroCategory     = document.getElementById('heroCategory');
const heroDescription  = document.getElementById('heroDescription');
const heroWatchBtn     = document.getElementById('heroWatchBtn');
const heroWatchlistBtn = document.getElementById('heroWatchlistBtn');


/* ─────────────────────────────────────────
   4. APP STATE
───────────────────────────────────────── */

let currentView     = 'home';
let currentCategory = 'All';
let featuredVideoId = null;

const allViews = {
  home      : homeView,
  browse    : browseView,
  search    : searchView,
  watchlist : watchlistView,
  history   : historyView
};


/* ─────────────────────────────────────────
   5. TOAST
───────────────────────────────────────── */

function showToast(message, type = 'success', duration = 3000) {

  if (!toastContainer) return;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const toast = document.createElement('div');

  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');

  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">
      ${icons[type] || 'ℹ️'}
    </span>

    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {

    toast.classList.add('removing');

    toast.addEventListener('animationend', () => {
      toast.remove();
    });

  }, duration);
}


/* ─────────────────────────────────────────
   6. PAGE LOADER
───────────────────────────────────────── */

function hidePageLoader() {

  if (!pageLoader) return;

  setTimeout(() => {

    pageLoader.classList.add('fade-out');

    setTimeout(() => {
      pageLoader.remove();
    }, 500);

  }, 900);
}


/* ─────────────────────────────────────────
   7. NAVBAR SCROLL
───────────────────────────────────────── */

function initScrollEffect() {

  if (!navbar) return;

  window.addEventListener('scroll', () => {

    navbar.classList.toggle(
      'scrolled',
      window.scrollY > 10
    );

  });
}


/* ─────────────────────────────────────────
   8. HAMBURGER / MOBILE NAV
───────────────────────────────────────── */

function initHamburger() {

  if (!hamburgerBtn || !mobileNav || !navbar) return;

  hamburgerBtn.addEventListener('click', () => {

    const isOpen =
      mobileNav.classList.toggle('open');

    hamburgerBtn.classList.toggle(
      'open',
      isOpen
    );

    hamburgerBtn.setAttribute(
      'aria-expanded',
      isOpen
    );

    mobileNav.setAttribute(
      'aria-hidden',
      !isOpen
    );

  });


  document.addEventListener('click', (e) => {

    if (
      !navbar.contains(e.target) &&
      !mobileNav.contains(e.target)
    ) {
      closeMobileNav();
    }

  });

}


function closeMobileNav() {

  if (!mobileNav || !hamburgerBtn) return;

  mobileNav.classList.remove('open');

  hamburgerBtn.classList.remove('open');

  hamburgerBtn.setAttribute(
    'aria-expanded',
    'false'
  );

  mobileNav.setAttribute(
    'aria-hidden',
    'true'
  );
}


/* ─────────────────────────────────────────
   9. NAVIGATION LINKS
───────────────────────────────────────── */

function initNavLinks() {

  document
    .querySelectorAll('.nav-link[data-page]')
    .forEach(link => {

      link.addEventListener('click', e => {

        e.preventDefault();

        handleNavClick(
          link.dataset.page,
          link.dataset.category
        );

      });

    });


  document
    .querySelectorAll('.mobile-nav-link[data-page]')
    .forEach(link => {

      link.addEventListener('click', e => {

        e.preventDefault();

        handleNavClick(
          link.dataset.page,
          link.dataset.category
        );

        closeMobileNav();

      });

    });


  document
    .querySelectorAll('[data-category-link]')
    .forEach(link => {

      link.addEventListener('click', e => {

        e.preventDefault();

        showBrowseView(
          link.dataset.categoryLink
        );

      });

    });


  document
    .querySelectorAll('footer [data-page]')
    .forEach(link => {

      link.addEventListener('click', e => {

        e.preventDefault();

        handleNavClick(
          link.dataset.page
        );

      });

    });


  document
    .querySelectorAll('[data-filter-section]')
    .forEach(btn => {

      btn.addEventListener('click', () => {

        showBrowseView('All');

      });

    });


  document
    .querySelectorAll('.dropdown-item[data-page]')
    .forEach(link => {

      link.addEventListener('click', e => {

        e.preventDefault();

        handleNavClick(
          link.dataset.page
        );

        if (userDropdown) {
          userDropdown.classList.remove('open');
        }

      });

    });

}


function handleNavClick(page, category = null) {

  switch (page) {

    case 'home':

      showView('home');

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      break;


    case 'movies':

      showBrowseView('Movies');

      break;


    case 'series':

      showBrowseView('Series');

      break;


    case 'categories':

      showView('home');

      setTimeout(() => {

        const el =
          document.getElementById(
            'categories-section'
          );

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth'
          });
        }

      }, 100);

      break;


    case 'watchlist':

      showView('watchlist');

      break;


    case 'history':

      showView('history');

      break;


    case 'profile':

      window.location.href =
        'pages/profile.html';

      break;

  }

  setActiveNavLink(page);
}


function setActiveNavLink(page) {

  document
    .querySelectorAll('.nav-link')
    .forEach(l => l.classList.remove('active'));

  document
    .querySelectorAll('.mobile-nav-link')
    .forEach(l => l.classList.remove('active'));


  const t =
    document.querySelector(
      `.nav-link[data-page="${page}"]`
    );

  if (t) {
    t.classList.add('active');
  }


  const mt =
    document.querySelector(
      `.mobile-nav-link[data-page="${page}"]`
    );

  if (mt) {
    mt.classList.add('active');
  }

}


/* ─────────────────────────────────────────
   10. VIEW SWITCHER
───────────────────────────────────────── */

function showView(viewName) {

  currentView = viewName;

  Object.values(allViews).forEach(view => {

    if (view) {
      view.classList.add('hidden');
    }

  });


  const target = allViews[viewName];

  if (target) {

    target.classList.remove('hidden');

    target.classList.add('fade-in');

  }


  if (viewName === 'watchlist') {
    renderWatchlist();
  }


  if (viewName === 'history') {
    renderHistory();
  }


  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

}


/* ─────────────────────────────────────────
   11. HERO SECTION
───────────────────────────────────────── */

function loadHero() {

  const video = getFeaturedVideo();


  if (!video) {

    if (heroBg) {

      heroBg.style.backgroundImage = 'none';

      heroBg.style.background =
        'linear-gradient(135deg, #1a1a24 0%, #0a0a0f 100%)';

    }


    if (heroTitle) {
      heroTitle.textContent = 'No Videos Yet';
    }

    if (heroRating) {
      heroRating.textContent = '–';
    }

    if (heroDuration) {
      heroDuration.textContent = '–';
    }

    if (heroYear) {
      heroYear.textContent = '–';
    }

    if (heroCategory) {
      heroCategory.textContent = '–';
    }

    if (heroDescription) {

      heroDescription.textContent =
        'The admin has not added any videos yet. Visit the Admin Panel to add content.';

    }


    if (heroWatchBtn) {
      heroWatchBtn.style.display = 'none';
    }

    if (heroWatchlistBtn) {
      heroWatchlistBtn.style.display = 'none';
    }

    return;
  }


  /* Video exists */

  if (heroWatchBtn) {
    heroWatchBtn.style.display = '';
  }

  if (heroWatchlistBtn) {
    heroWatchlistBtn.style.display = '';
  }


  featuredVideoId = video.id;


  if (heroBg) {

    if (video.thumbnail) {

      heroBg.style.backgroundImage =
        `url('${video.thumbnail}')`;

    } else {

      heroBg.style.backgroundImage =
        'linear-gradient(135deg, #1a1a24 0%, #0a0a0f 100%)';

    }

    heroBg.setAttribute(
      'aria-label',
      `Featured: ${video.title}`
    );

  }


  if (heroTitle) {
    heroTitle.textContent = video.title;
  }

  if (heroRating) {
    heroRating.textContent =
      `${video.rating} / 10`;
  }

  if (heroDuration) {
    heroDuration.textContent =
      video.duration;
  }

  if (heroYear) {
    heroYear.textContent =
      video.year;
  }

  if (heroCategory) {
    heroCategory.textContent =
      video.category;
  }

  if (heroDescription) {
    heroDescription.textContent =
      video.description;
  }


  if (heroWatchBtn) {

    heroWatchBtn.onclick =
      () => openVideo(video.id);

  }


  if (heroWatchlistBtn) {

    heroWatchlistBtn.onclick = () => {

      toggleWatchlist(video.id);

      updateHeroWatchlistBtn(
        video.id
      );

    };

  }


  updateHeroWatchlistBtn(
    video.id
  );

}


function updateHeroWatchlistBtn(videoId) {

  if (!heroWatchlistBtn) return;

  const inList =
    isInWatchlist(videoId);


  heroWatchlistBtn.classList.toggle(
    'active',
    inList
  );


  heroWatchlistBtn.innerHTML =
    inList

      ? '<i class="fas fa-check" aria-hidden="true"></i> In Watchlist'

      : '<i class="fas fa-plus" aria-hidden="true"></i> Watchlist';

}


/* ─────────────────────────────────────────
   12. VIDEO CARD
───────────────────────────────────────── */

function createVideoCard(video, delay = 0) {

  const inWatchlist =
    isInWatchlist(video.id);


  const card =
    document.createElement('article');


  card.className =
    `video-card delay-${delay % 8}`;


  card.setAttribute(
    'role',
    'button'
  );


  card.setAttribute(
    'tabindex',
    '0'
  );


  card.setAttribute(
    'aria-label',
    `Watch ${video.title}`
  );


  card.dataset.videoId =
    video.id;


  const thumbnail =
    video.thumbnail ||
    `https://picsum.photos/seed/${video.id}/640/360`;


  card.innerHTML = `

    <div class="card-thumbnail">

      <img
        src="${thumbnail}"
        alt="Thumbnail for ${video.title}"
        loading="lazy"
        onerror="this.src='https://picsum.photos/seed/${video.id}/640/360'"
      />

      <div class="card-overlay" aria-hidden="true">

        <button
          class="play-btn"
          aria-label="Play ${video.title}"
        >
          <i class="fas fa-play"></i>
        </button>

      </div>

      <span class="card-duration">
        ${video.duration || '0:00'}
      </span>

      <button
        class="card-watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}"
        aria-label="${inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}"
        data-id="${video.id}"
      >
        <i class="fas ${inWatchlist ? 'fa-check' : 'fa-plus'}"></i>
      </button>

    </div>


    <div class="card-body">

      <h3 class="card-title">
        ${video.title}
      </h3>

      <div class="card-meta">

        <span class="card-category">
          ${video.category}
        </span>

        <span
          class="card-rating"
          aria-label="Rating: ${video.rating}"
        >
          <i class="fas fa-star" aria-hidden="true"></i>
          ${video.rating}
        </span>

      </div>

    </div>
  `;


  card.addEventListener('click', e => {

    if (
      e.target.closest(
        '.card-watchlist-btn'
      )
    ) {
      return;
    }

    openVideo(video.id);

  });


  card.addEventListener('keydown', e => {

    if (
      (e.key === 'Enter' || e.key === ' ') &&
      !e.target.closest(
        '.card-watchlist-btn'
      )
    ) {

      e.preventDefault();

      openVideo(video.id);

    }

  });


  const wlBtn =
    card.querySelector(
      '.card-watchlist-btn'
    );


  if (wlBtn) {

    wlBtn.addEventListener(
      'click',
      e => {

        e.stopPropagation();

        toggleWatchlist(
          video.id
        );


        const nowIn =
          isInWatchlist(
            video.id
          );


        wlBtn.classList.toggle(
          'in-watchlist',
          nowIn
        );


        wlBtn.setAttribute(
          'aria-label',
          nowIn
            ? 'Remove from watchlist'
            : 'Add to watchlist'
        );


        wlBtn.innerHTML =
          `<i class="fas ${nowIn ? 'fa-check' : 'fa-plus'}"></i>`;


        if (
          featuredVideoId === video.id
        ) {

          updateHeroWatchlistBtn(
            video.id
          );

        }

      }
    );

  }


  return card;
}


/* ─────────────────────────────────────────
   13. RENDER VIDEOS
───────────────────────────────────────── */

function renderVideos(videos, container) {

  if (!container) return;

  container.innerHTML = '';


  if (!videos || videos.length === 0) {
    return;
  }


  videos.forEach((video, i) => {

    container.appendChild(
      createVideoCard(video, i)
    );

  });

}


/* ─────────────────────────────────────────
   14. EMPTY SECTION
───────────────────────────────────────── */

function renderEmptySection(
  container,
  message
) {

  if (!container) return;


  container.innerHTML = `

    <div
      style="
        grid-column:1/-1;
        text-align:center;
        padding:40px 20px;
        color:var(--text-muted);
      "
    >

      <div
        style="
          font-size:2.5rem;
          margin-bottom:10px;
        "
        aria-hidden="true"
      >
        🎬
      </div>

      <p style="font-size:.9rem;">
        ${message}
      </p>

    </div>

  `;

}


/* ─────────────────────────────────────────
   15. HOME SECTIONS
───────────────────────────────────────── */

function loadHomeSections() {

  const all = getVideos();


  console.log(
    '[KL Video] Homepage videos:',
    all
  );


  if (all.length === 0) {

    renderEmptySection(
      trendingGrid,
      'No videos yet. Admin can add videos via the Admin Panel.'
    );


    renderEmptySection(
      popularGrid,
      'No videos yet.'
    );


    renderEmptySection(
      recentGrid,
      'No videos yet.'
    );


    loadCategoryCards();

    loadRecommendations();

    return;
  }


  /* Trending */

  const trending =
    [...all]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .slice(0, 8);


  renderVideos(
    trending,
    trendingGrid
  );


  /* Popular */

  const popular =
    [...all]
      .sort(
        (a, b) =>
          parseViewCount(b.views) -
          parseViewCount(a.views)
      )
      .slice(0, 8);


  renderVideos(
    popular,
    popularGrid
  );


  /* Recently added */

  const recent =
    [...all]
      .sort(
        (a, b) =>
          Number(b.id) -
          Number(a.id)
      )
      .slice(0, 8);


  renderVideos(
    recent,
    recentGrid
  );


  loadCategoryCards();

  loadRecommendations();

}


function parseViewCount(viewStr) {

  if (!viewStr) return 0;


  const s =
    String(viewStr)
      .replace(/,/g, '')
      .trim();


  if (s.endsWith('M')) {
    return parseFloat(s) * 1000000;
  }


  if (s.endsWith('K')) {
    return parseFloat(s) * 1000;
  }


  return parseFloat(s) || 0;
}


/* ─────────────────────────────────────────
   16. RECOMMENDATIONS
───────────────────────────────────────── */

function loadRecommendations() {

  const session =
    lsGetObj(LS.SESSION);


  if (!session) {

    if (recommendedSection) {
      recommendedSection.style.display =
        'none';
    }

    return;
  }


  const recs =
    getRecommendations(
      session.email,
      8
    );


  if (recs.length > 0) {

    if (recommendedSection) {
      recommendedSection.style.display = '';
    }

    renderVideos(
      recs,
      recommendedGrid
    );

  } else {

    if (recommendedSection) {
      recommendedSection.style.display =
        'none';
    }

  }

}


/* Category icons */

const CATEGORY_ICONS = {

  Movies: '🎬',
  Series: '📺',
  Action: '💥',
  Comedy: '😂',
  Drama: '🎭',
  Animation: '✨',
  Documentary: '🎥',
  Sports: '⚽',
  Technology: '💻',
  Music: '🎵'

};


function loadCategoryCards() {

  if (!categoriesGrid) return;

  categoriesGrid.innerHTML = '';


  const cats =
    getAllCategories()
      .filter(c => c !== 'All');


  cats.forEach(cat => {

    const card =
      document.createElement('div');


    card.className =
      'category-card';


    card.setAttribute(
      'role',
      'button'
    );


    card.setAttribute(
      'tabindex',
      '0'
    );


    card.setAttribute(
      'aria-label',
      `Browse ${cat}`
    );


    card.innerHTML = `

      <span
        class="category-icon"
        aria-hidden="true"
      >
        ${CATEGORY_ICONS[cat] || '🎞️'}
      </span>

      <span class="category-name">
        ${cat}
      </span>

    `;


    card.addEventListener(
      'click',
      () => showBrowseView(cat)
    );


    card.addEventListener(
      'keydown',
      e => {

        if (
          e.key === 'Enter' ||
          e.key === ' '
        ) {

          e.preventDefault();

          showBrowseView(cat);

        }

      }
    );


    categoriesGrid.appendChild(card);

  });

}


/* ─────────────────────────────────────────
   17. BROWSE
───────────────────────────────────────── */

function showBrowseView(
  category = 'All'
) {

  currentCategory =
    category;


  showView('browse');


  browseTitle.textContent =
    category === 'All'
      ? 'All Videos'
      : category;


  browseSubtitle.textContent =
    category === 'All'
      ? `Showing all ${getVideos().length} videos`
      : `Showing videos in "${category}"`;


  buildCategoryFilterBar(
    category
  );


  renderVideos(
    getVideosByCategory(category),
    browseGrid
  );


  setActiveNavLink(
    category.toLowerCase()
  );

}


function buildCategoryFilterBar(
  activeCategory
) {

  if (!categoryFilterBar) return;


  const categories =
    getAllCategories();


  categoryFilterBar.innerHTML =
    '';


  categories.forEach(cat => {

    const btn =
      document.createElement('button');


    btn.className =
      `filter-btn ${
        cat === activeCategory
          ? 'active'
          : ''
      }`;


    btn.textContent =
      cat;


    btn.setAttribute(
      'role',
      'tab'
    );


    btn.setAttribute(
      'aria-selected',
      cat === activeCategory
    );


    btn.addEventListener(
      'click',
      () => {

        currentCategory =
          cat;


        categoryFilterBar
          .querySelectorAll(
            '.filter-btn'
          )
          .forEach(b => {

            b.classList.remove(
              'active'
            );

            b.setAttribute(
              'aria-selected',
              'false'
            );

          });


        btn.classList.add(
          'active'
        );


        btn.setAttribute(
          'aria-selected',
          'true'
        );


        const results =
          getVideosByCategory(cat);


        browseTitle.textContent =
          cat === 'All'
            ? 'All Videos'
            : cat;


        browseSubtitle.textContent =
          `Showing ${results.length} video${
            results.length !== 1
              ? 's'
              : ''
          }`;


        renderVideos(
          results,
          browseGrid
        );

      }
    );


    categoryFilterBar
      .appendChild(btn);

  });

}


/* ─────────────────────────────────────────
   18. SEARCH
───────────────────────────────────────── */

function initSearch() {

  if (!searchToggleBtn ||
      !searchBox ||
      !searchInput) {
    return;
  }


  searchToggleBtn.addEventListener(
    'click',
    e => {

      e.stopPropagation();


      const isOpen =
        searchBox.classList.toggle(
          'open'
        );


      searchToggleBtn.setAttribute(
        'aria-expanded',
        isOpen
      );


      if (isOpen) {
        searchInput.focus();
      } else {
        clearSearch();
      }

    }
  );


  searchInput.addEventListener(
    'input',
    () => {

      const q =
        searchInput.value.trim();


      if (q.length > 0) {
        performSearch(q);
      } else {
        clearSearch();
      }

    }
  );


  if (searchClearBtn) {

    searchClearBtn.addEventListener(
      'click',
      () => {

        searchInput.value = '';

        clearSearch();

        searchInput.focus();

      }
    );

  }


  if (mobileSearchInput) {

    mobileSearchInput.addEventListener(
      'input',
      () => {

        const q =
          mobileSearchInput.value.trim();


        if (q.length > 0) {

          performSearch(q);

          closeMobileNav();

        } else {

          clearSearch();

        }

      }
    );

  }


  document.addEventListener(
    'click',
    e => {

      if (
        !searchBox.contains(e.target) &&
        e.target !== searchToggleBtn
      ) {

        if (
          searchBox.classList.contains(
            'open'
          ) &&
          !searchInput.value
        ) {

          searchBox.classList.remove(
            'open'
          );

          searchToggleBtn.setAttribute(
            'aria-expanded',
            'false'
          );

        }

      }

    }
  );

}


function performSearch(query) {

  const q =
    query.toLowerCase();


  const results =
    getVideos().filter(v =>

      String(v.title || '')
        .toLowerCase()
        .includes(q)

      ||

      String(v.description || '')
        .toLowerCase()
        .includes(q)

      ||

      String(v.category || '')
        .toLowerCase()
        .includes(q)

    );


  showView('search');


  if (searchQueryLabel) {
    searchQueryLabel.textContent =
      `"${query}"`;
  }


  if (results.length === 0) {

    if (searchGrid) {
      searchGrid.innerHTML = '';
    }

    if (noResults) {
      noResults.classList.remove(
        'hidden'
      );
    }

  } else {

    if (noResults) {
      noResults.classList.add(
        'hidden'
      );
    }

    renderVideos(
      results,
      searchGrid
    );

  }

}


function clearSearch() {

  if (searchInput) {
    searchInput.value = '';
  }


  if (mobileSearchInput) {
    mobileSearchInput.value = '';
  }


  if (currentView === 'search') {
    showView('home');
  }

}


/* ─────────────────────────────────────────
   19. OPEN VIDEO
───────────────────────────────────────── */

function openVideo(id) {

  addToHistory(id);

  window.location.href =
    `pages/watch.html?id=${id}`;

}


/* ─────────────────────────────────────────
   20. WATCHLIST
───────────────────────────────────────── */

function getWatchlist() {

  return lsGet(
    getUserKey('kl_watchlist')
  );

}


function isInWatchlist(id) {

  return getWatchlist()
    .includes(Number(id));

}


function addToWatchlist(id) {

  const list =
    getWatchlist();


  const numId =
    Number(id);


  if (!list.includes(numId)) {

    list.push(numId);


    lsSet(
      getUserKey('kl_watchlist'),
      list
    );


    showToast(
      'Added to Watchlist 🔖',
      'success'
    );


    return true;
  }


  return false;
}


function removeFromWatchlist(id) {

  const numId =
    Number(id);


  lsSet(
    getUserKey('kl_watchlist'),
    getWatchlist()
      .filter(v => v !== numId)
  );


  showToast(
    'Removed from Watchlist',
    'info'
  );

}


function toggleWatchlist(id) {

  if (isInWatchlist(id)) {
    removeFromWatchlist(id);
  } else {
    addToWatchlist(id);
  }

}


function renderWatchlist() {

  const list =
    getWatchlist();


  const videos =
    list
      .map(id => getVideoById(id))
      .filter(Boolean);


  if (videos.length === 0) {

    if (watchlistGrid) {
      watchlistGrid.innerHTML = '';
    }

    if (watchlistEmpty) {
      watchlistEmpty.classList.remove(
        'hidden'
      );
    }

  } else {

    if (watchlistEmpty) {
      watchlistEmpty.classList.add(
        'hidden'
      );
    }

    renderVideos(
      videos,
      watchlistGrid
    );

  }

}


function initWatchlistClear() {

  if (!clearWatchlistBtn) return;


  clearWatchlistBtn.addEventListener(
    'click',
    () => {

      if (
        getWatchlist().length === 0
      ) {

        showToast(
          'Watchlist is already empty',
          'info'
        );

        return;
      }


      lsSet(
        getUserKey('kl_watchlist'),
        []
      );


      renderWatchlist();


      showToast(
        'Watchlist cleared',
        'info'
      );

    }
  );

}


/* ─────────────────────────────────────────
   21. HISTORY
───────────────────────────────────────── */

function getHistory() {

  return lsGet(
    getUserKey('kl_history')
  );

}


function addToHistory(id) {

  const numId =
    Number(id);


  let history =
    getHistory()
      .filter(h => h.id !== numId);


  history.unshift({
    id: numId,
    timestamp: Date.now()
  });


  lsSet(
    getUserKey('kl_history'),
    history.slice(0, 50)
  );

}


function renderHistory() {

  const history =
    getHistory();


  const videos =
    history
      .map(h => getVideoById(h.id))
      .filter(Boolean);


  if (videos.length === 0) {

    if (historyGrid) {
      historyGrid.innerHTML = '';
    }

    if (historyEmpty) {
      historyEmpty.classList.remove(
        'hidden'
      );
    }

  } else {

    if (historyEmpty) {
      historyEmpty.classList.add(
        'hidden'
      );
    }

    renderVideos(
      videos,
      historyGrid
    );

  }

}


function initHistoryClear() {

  if (!clearHistoryBtn) return;


  clearHistoryBtn.addEventListener(
    'click',
    () => {

      if (
        getHistory().length === 0
      ) {

        showToast(
          'History is already empty',
          'info'
        );

        return;
      }


      lsSet(
        getUserKey('kl_history'),
        []
      );


      renderHistory();


      showToast(
        'Watch history cleared',
        'info'
      );

    }
  );

}


/* ─────────────────────────────────────────
   22. LIKES
───────────────────────────────────────── */

function getLikes() {

  return lsGet(
    getUserKey('kl_likes')
  );

}


function isLiked(id) {

  return getLikes()
    .includes(Number(id));

}


function toggleLike(id) {

  const numId =
    Number(id);


  let likes =
    getLikes();


  if (likes.includes(numId)) {

    lsSet(
      getUserKey('kl_likes'),
      likes.filter(v => v !== numId)
    );


    showToast(
      'Removed from Liked Videos',
      'info'
    );


    return false;

  } else {

    likes.push(numId);


    lsSet(
      getUserKey('kl_likes'),
      likes
    );


    showToast(
      'Video Liked! ❤️',
      'success'
    );


    return true;

  }

}


/* ─────────────────────────────────────────
   23. SHARE
───────────────────────────────────────── */

async function shareVideo(id, title) {

  const url =
    `${window.location.origin}` +
    `${window.location.pathname.replace('index.html', '')}` +
    `pages/watch.html?id=${id}`;


  if (navigator.share) {

    try {

      await navigator.share({
        title:
          `Watch ${title} on KL Video`,
        url
      });

      return;

    } catch (err) {

      if (
        err.name === 'AbortError'
      ) {
        return;
      }

    }

  }


  copyToClipboard(url);

}


function copyToClipboard(text) {

  if (navigator.clipboard) {

    navigator.clipboard
      .writeText(text)
      .then(() => {

        showToast(
          'Link copied to clipboard! 📋',
          'success'
        );

      });

  } else {

    const el =
      document.createElement(
        'textarea'
      );


    el.value = text;

    el.style.position = 'fixed';

    el.style.opacity = '0';


    document.body.appendChild(el);

    el.select();

    document.execCommand('copy');

    document.body.removeChild(el);


    showToast(
      'Link copied! 📋',
      'success'
    );

  }

}


/* ─────────────────────────────────────────
   24. AUTH
───────────────────────────────────────── */

function getSession() {

  return lsGetObj(
    LS.SESSION
  );

}


function isLoggedIn() {

  return getSession() !== null;

}


function updateAuthUI() {

  const session =
    getSession();


  if (session) {

    if (authButtons) {
      authButtons.classList.add(
        'hidden'
      );
    }

    if (userMenu) {
      userMenu.classList.remove(
        'hidden'
      );
    }

    if (mobileAuthBtns) {
      mobileAuthBtns.classList.add(
        'hidden'
      );
    }

    if (mobileUserInfo) {
      mobileUserInfo.classList.remove(
        'hidden'
      );
    }


    const initial =
      (session.name || 'U')[0]
        .toUpperCase();


    if (userAvatarInit) {
      userAvatarInit.textContent =
        initial;
    }

    if (dropdownName) {
      dropdownName.textContent =
        session.name || 'User';
    }

    if (dropdownEmail) {
      dropdownEmail.textContent =
        session.email || '';
    }

    if (mobileUserName) {
      mobileUserName.textContent =
        `Hello, ${session.name || 'User'}`;
    }

  } else {

    if (authButtons) {
      authButtons.classList.remove(
        'hidden'
      );
    }

    if (userMenu) {
      userMenu.classList.add(
        'hidden'
      );
    }

    if (mobileAuthBtns) {
      mobileAuthBtns.classList.remove(
        'hidden'
      );
    }

    if (mobileUserInfo) {
      mobileUserInfo.classList.add(
        'hidden'
      );
    }

  }

}


function registerUser(
  name,
  email,
  password
) {

  let users = [];


  try {

    users =
      JSON.parse(
        localStorage.getItem(
          'kl_users'
        )
      ) || [];

  } catch {

    users = [];

  }


  if (
    users.find(
      u =>
        u.email.toLowerCase() ===
        email.toLowerCase()
    )
  ) {

    return {
      success: false,
      message:
        'An account with this email already exists.'
    };

  }


  users.push({
    name,
    email,
    password,
    role: 'user',
    joined: Date.now()
  });


  localStorage.setItem(
    'kl_users',
    JSON.stringify(users)
  );


  lsSet(
    LS.SESSION,
    {
      name,
      email,
      role: 'user'
    }
  );


  updateAuthUI();


  return {
    success: true
  };

}


function loginUser(
  email,
  password
) {

  let users = [];


  try {

    users =
      JSON.parse(
        localStorage.getItem(
          'kl_users'
        )
      ) || [];

  } catch {

    users = [];

  }


  if (users.length === 0) {

    users = [
      {
        name: 'Demo User',
        email: 'demo@klvideo.com',
        password: 'Demo@1234',
        role: 'user',
        joined: Date.now()
      }
    ];


    localStorage.setItem(
      'kl_users',
      JSON.stringify(users)
    );

  }


  const user =
    users.find(
      u =>
        u.email.toLowerCase() ===
        email.toLowerCase()
    );


  if (!user) {

    return {
      success: false,
      message:
        'No account found with this email.'
    };

  }


  if (
    user.password !== password
  ) {

    return {
      success: false,
      message:
        'Incorrect password.'
    };

  }


  lsSet(
    LS.SESSION,
    {
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    }
  );


  updateAuthUI();


  return {
    success: true
  };

}


function logoutUser() {

  localStorage.removeItem(
    LS.SESSION
  );


  updateAuthUI();


  showToast(
    'Logged out successfully. See you soon! 👋',
    'info'
  );

}


function initLogout() {

  if (logoutBtn) {

    logoutBtn.addEventListener(
      'click',
      () => {

        logoutUser();

        if (userDropdown) {
          userDropdown.classList.remove(
            'open'
          );
        }

      }
    );


    logoutBtn.addEventListener(
      'keydown',
      e => {

        if (e.key === 'Enter') {
          logoutUser();
        }

      }
    );

  }


  if (mobileLogoutBtn) {

    mobileLogoutBtn.addEventListener(
      'click',
      () => {

        logoutUser();

        closeMobileNav();

      }
    );

  }

}


function initUserDropdown() {

  if (!userAvatarBtn) return;


  userAvatarBtn.addEventListener(
    'click',
    e => {

      e.stopPropagation();


      const isOpen =
        userDropdown.classList.toggle(
          'open'
        );


      userAvatarBtn.setAttribute(
        'aria-expanded',
        isOpen
      );

    }
  );


  document.addEventListener(
    'click',
    () => {

      if (userDropdown) {
        userDropdown.classList.remove(
          'open'
        );
      }


      userAvatarBtn.setAttribute(
        'aria-expanded',
        'false'
      );

    }
  );

}


/* ─────────────────────────────────────────
   25. KEYBOARD SHORTCUTS
───────────────────────────────────────── */

function initKeyboardShortcuts() {

  document.addEventListener(
    'keydown',
    e => {

      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA'
      ) {
        return;
      }


      if (e.key === 'Escape') {

        if (
          searchBox &&
          searchBox.classList.contains(
            'open'
          )
        ) {

          searchBox.classList.remove(
            'open'
          );


          if (searchToggleBtn) {

            searchToggleBtn.setAttribute(
              'aria-expanded',
              'false'
            );

          }


          clearSearch();

        }

      }

    }
  );

}


/* ─────────────────────────────────────────
   26. HASH ROUTING
───────────────────────────────────────── */

function handleHashRouting() {

  const hash =
    window.location.hash.replace(
      '#',
      ''
    );


  if (hash === 'watchlist') {

    showView('watchlist');

  } else if (hash === 'history') {

    showView('history');

  } else if (hash === 'categories') {

    showView('home');


    setTimeout(() => {

      const el =
        document.getElementById(
          'categories-section'
        );


      if (el) {

        el.scrollIntoView({
          behavior: 'smooth'
        });

      }

    }, 150);

  }

}


window.addEventListener(
  'hashchange',
  handleHashRouting
);


/* ============================================================
   27. INITIALIZATION
   ============================================================

   IMPORTANT FIX:

   The old code did:

       loadHero();
       loadHomeSections();

   before the API finished loading.

   The corrected code does:

       await klVideoAPI.sync();
       loadHero();
       loadHomeSections();

   This makes the homepage use the videos stored by the
   Node.js / Express backend.
   ============================================================ */

async function init() {

  console.log(
    '[KL Video] Starting application...'
  );


  /* ────────────────────────────────────────
     1. Sync videos from Express backend
  ──────────────────────────────────────── */

  try {

    const videos =
      await klVideoAPI.sync();


    console.log(
      `[KL Video] Loaded ${videos.length} video(s) from server.`
    );


  } catch (error) {

    console.error(
      '[KL Video] Video sync failed:',
      error
    );

  }


  /* ────────────────────────────────────────
     2. Remove old demo/sample videos
  ──────────────────────────────────────── */

  (function clearOldSeedData() {

    try {

      const stored =
        localStorage.getItem(
          'kl_videos'
        );


      if (!stored) return;


      const arr =
        JSON.parse(stored);


      if (!Array.isArray(arr)) {
        return;
      }


      const hasSeedVideos =
        arr.some(v =>

          Number(v.id) <= 20 &&

          typeof v.videoUrl ===
            'string' &&

          v.videoUrl.includes(
            'commondatastorage.googleapis.com/gtv-videos-bucket/sample/'
          )

        );


      if (hasSeedVideos) {

        console.info(
          '[KL Video] Old sample videos detected.'
        );

      }

    } catch (e) {

      console.warn(
        '[KL Video] Could not check old seed data.'
      );

    }

  })();


  /* ────────────────────────────────────────
     3. Update authentication UI
  ──────────────────────────────────────── */

  updateAuthUI();


  /* ────────────────────────────────────────
     4. NOW render videos
  ──────────────────────────────────────── */

  loadHero();

  loadHomeSections();

  showView('home');


  /* ────────────────────────────────────────
     5. Initialize other features
  ──────────────────────────────────────── */

  initScrollEffect();

  initHamburger();

  initNavLinks();

  initSearch();

  initWatchlistClear();

  initHistoryClear();

  initLogout();

  initUserDropdown();

  initKeyboardShortcuts();

  handleHashRouting();

  hidePageLoader();


  console.log(
    '[KL Video] Application ready.'
  );

}


/* Start application */

document.addEventListener(
  'DOMContentLoaded',
  init
);