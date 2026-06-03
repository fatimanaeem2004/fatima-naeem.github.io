/**
 * Portfolio Script
 * – Particle canvas background
 * – Typewriter animation
 * – GitHub API integration (with localStorage caching)
 * – Scroll-triggered reveal animations
 * – Navbar scroll behavior
 * – Mobile menu
 */

/* ─────────────────────────────────────────────────
   LANGUAGE COLOR MAP
───────────────────────────────────────────────── */
const LANG_COLORS = {
  JavaScript:  '#f1e05a',
  TypeScript:  '#3178c6',
  Python:      '#3572A5',
  Java:        '#b07219',
  'C++':       '#f34b7d',
  C:           '#555555',
  'C#':        '#178600',
  Ruby:        '#701516',
  Go:          '#00ADD8',
  Rust:        '#dea584',
  Swift:       '#F05138',
  Kotlin:      '#A97BFF',
  PHP:         '#4F5D95',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  SCSS:        '#c6538c',
  Shell:       '#89e051',
  R:           '#198CE7',
  Dart:        '#00B4AB',
  Vue:         '#41B883',
  Svelte:      '#ff3e00',
  Jupyter:     '#DA5B0B',
};

/* ─────────────────────────────────────────────────
   CACHE — 1-hour localStorage TTL
───────────────────────────────────────────────── */
const Cache = {
  _prefix: 'pf_',
  _ttl: 60 * 60 * 1000, // 1 hour

  get(key) {
    try {
      const raw = localStorage.getItem(this._prefix + key);
      if (!raw) return null;
      const { v, t } = JSON.parse(raw);
      if (Date.now() - t > this._ttl) {
        localStorage.removeItem(this._prefix + key);
        return null;
      }
      return v;
    } catch { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(
        this._prefix + key,
        JSON.stringify({ v: value, t: Date.now() })
      );
    } catch {}
  }
};

/* ─────────────────────────────────────────────────
   GITHUB API
───────────────────────────────────────────────── */
async function ghFetch(path) {
  const cacheKey = path.replace(/\//g, '_');
  const cached = Cache.get(cacheKey);
  if (cached) return cached;

  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${path}`);

  const data = await res.json();
  Cache.set(cacheKey, data);
  return data;
}

/* ─────────────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────────────── */
class Typewriter {
  constructor(el, phrases, { typeMs = 75, deleteMs = 38, pauseMs = 2200 } = {}) {
    this.el       = el;
    this.phrases  = phrases;
    this.typeMs   = typeMs;
    this.deleteMs = deleteMs;
    this.pauseMs  = pauseMs;
    this.idx      = 0;
    this.pos      = 0;
    this.deleting = false;
    this._tick();
  }

  _tick() {
    const phrase = this.phrases[this.idx];

    if (this.deleting) {
      this.pos--;
    } else {
      this.pos++;
    }

    this.el.textContent = phrase.slice(0, this.pos);

    let delay = this.deleting ? this.deleteMs : this.typeMs;

    if (!this.deleting && this.pos === phrase.length) {
      delay = this.pauseMs;
      this.deleting = true;
    } else if (this.deleting && this.pos === 0) {
      this.deleting = false;
      this.idx = (this.idx + 1) % this.phrases.length;
      delay = 300;
    }

    setTimeout(() => this._tick(), delay);
  }
}

/* ─────────────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────────────── */
class Particles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.dots   = [];
    this._resize();
    this._populate();
    window.addEventListener('resize', () => {
      this._resize();
      this._populate();
    });
    this._loop();
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.w = this.canvas.width;
    this.h = this.canvas.height;
  }

  _populate() {
    const count = Math.max(40, Math.floor((this.w * this.h) / 14000));
    this.dots = Array.from({ length: count }, () => ({
      x:  Math.random() * this.w,
      y:  Math.random() * this.h,
      r:  Math.random() * 1.3 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a:  Math.random() * 0.55 + 0.08,
    }));
  }

  _loop() {
    const { ctx, w, h, dots } = this;
    ctx.clearRect(0, 0, w, h);

    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,205,184,${d.a})`;
      ctx.fill();
    }

    // Connection lines
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx   = dots[i].x - dots[j].x;
        const dy   = dots[i].y - dots[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(0,205,184,${0.07 * (1 - dist / 110)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this._loop());
  }
}

/* ─────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
function repoTitle(name) {
  return name.replace(/[-_]/g, ' ')
             .replace(/\b\w/g, c => c.toUpperCase());
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setHref(id, href) {
  const el = document.getElementById(id);
  if (el) el.href = href;
}

/* ─────────────────────────────────────────────────
   SKELETON CARDS
───────────────────────────────────────────────── */
function skeletonHTML() {
  return `
    <div class="project-card skeleton">
      <div class="card-body" style="gap:14px">
        <div class="skel-line s"></div>
        <div class="skel-line l"></div>
        <div class="skel-line m"></div>
        <div class="skel-line l"></div>
        <div class="skel-line s"></div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────────── */
function cardHTML(repo, langs) {
  const topLangs = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const topics = (repo.topics || []).slice(0, 5);

  const langsHTML = topLangs.length
    ? topLangs.map((l, i) => `
        ${i > 0 ? '<span class="lang-sep">·</span>' : ''}
        <span class="lang-dot" style="background:${LANG_COLORS[l] || '#7a8fae'}"></span>
        <span>${l}</span>
      `).join('')
    : '<span style="color:var(--text-3);font-size:.75rem">No language data</span>';

  const topicsHTML = topics.length
    ? `<div class="card-topics">${topics.map(t => `<span class="topic">${t}</span>`).join('')}</div>`
    : '';

  return `
    <div class="project-card fade-in">
      <div class="card-body">
        <div class="card-top">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="19" height="19">
              <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/>
            </svg>
          </span>
          <span class="card-stars">
            <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${repo.stargazers_count}
          </span>
        </div>

        <h3 class="card-name">${repoTitle(repo.name)}</h3>
        <p class="card-desc">${repo.description || 'No description provided.'}</p>
        ${topicsHTML}
      </div>

      <div class="card-footer">
        <div class="card-langs">${langsHTML}</div>
        <a class="card-link" href="${repo.html_url}" target="_blank" rel="noopener">
          View on GitHub
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <path d="M7 17L17 7M7 7h10v10"/>
          </svg>
        </a>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────────
   MAIN INIT
───────────────────────────────────────────────── */
async function init() {
  const cfg = CONFIG; // loaded from config.js

  /* ── Page title ── */
  document.title = `${cfg.name} — Portfolio`;

  /* ── Initials in nav logo ── */
  const initials = cfg.name.split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .join('');
  setEl('navLogo', initials);

  /* ── Hero ── */
  setEl('heroName', cfg.name);
  const sub = [cfg.role, cfg.location].filter(Boolean).join(' · ');
  setEl('heroSub', sub);

  /* ── About ── */
  setEl('aboutPara', cfg.about.trim());
  setEl('statFeatured', cfg.featuredRepos.length);

  /* ── Resume ── */
  if (cfg.resume) {
    const resumeBtn = document.getElementById('resumeBtn');
    const navResume = document.getElementById('navResume');
    if (resumeBtn) { resumeBtn.href = cfg.resume; resumeBtn.style.display = 'inline-flex'; }
    if (navResume) { navResume.href = cfg.resume; navResume.style.display = ''; }
  } else {
    const nr = document.getElementById('navResume');
    if (nr) nr.style.display = 'none';
  }

  /* ── Links ── */
  const ghURL = `https://github.com/${cfg.github}`;
  setHref('heroGithub',    ghURL);
  setHref('heroLinkedin',  cfg.linkedin || '#');
  setHref('allProjectsLink', ghURL);
  setHref('ctaGithub',    ghURL);
  setHref('ctaLinkedin',  cfg.linkedin || '#');
  setEl  ('footerName',   cfg.name);

  const emailEl = document.getElementById('contactEmail');
  if (emailEl) {
    emailEl.textContent = cfg.email;
    emailEl.href = `mailto:${cfg.email}`;
  }

  /* ── Particles ── */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) new Particles(canvas);

  /* ── Typewriter ── */
  const dynEl = document.getElementById('taglineDynamic');
  if (dynEl && cfg.taglines.length) new Typewriter(dynEl, cfg.taglines);

  /* ── Skills ── */
  const skillsGrid = document.getElementById('skillsGrid');
  if (skillsGrid && cfg.skills.length) {
    skillsGrid.innerHTML = cfg.skills.map((grp, i) => `
      <div class="skill-group fade-in" style="transition-delay:${i * 0.08}s">
        <div class="skill-cat">${grp.category}</div>
        <div class="skill-tags">
          ${grp.items.map(it => `<span class="skill-tag">${it}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  /* ── GitHub user stats ── */
  try {
    const user = await ghFetch(`/users/${cfg.github}`);
    setEl('statRepos',     user.public_repos ?? '—');
    setEl('statFollowers', user.followers    ?? '—');
  } catch (err) {
    console.warn('GitHub user fetch failed:', err.message);
  }

  /* ── Projects ── */
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  if (!cfg.featuredRepos.length) {
    grid.innerHTML = `
      <div class="empty-notice">
        Add repository names to <code>config.js</code> → <code>featuredRepos</code>
        to display your projects here.<br/><br/>
        Example: <code>"my-awesome-project"</code>
      </div>`;
    initReveal();
    return;
  }

  // Show skeletons while loading
  grid.innerHTML = cfg.featuredRepos.map(() => skeletonHTML()).join('');

  // Fetch all repos in parallel
  const results = await Promise.allSettled(
    cfg.featuredRepos.map(async name => {
      const [repo, langs] = await Promise.all([
        ghFetch(`/repos/${cfg.github}/${name}`),
        ghFetch(`/repos/${cfg.github}/${name}/languages`),
      ]);
      return { repo, langs };
    })
  );

  // Count total stars
  let totalStars = 0;
  const cards = results.map(r => {
    if (r.status === 'fulfilled') {
      totalStars += r.value.repo.stargazers_count || 0;
      return cardHTML(r.value.repo, r.value.langs);
    }
    return ''; // silently skip failed
  });

  grid.innerHTML = cards.join('') || `<div class="empty-notice">Could not load projects. Check your GitHub username in <code>config.js</code>.</div>`;
  setEl('statStars', totalStars);

  // Re-run reveal for dynamically added cards
  initReveal();
}

/* ─────────────────────────────────────────────────
   NAVBAR SCROLL EFFECT
───────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const update = () => nav.classList.toggle('stuck', window.scrollY > 40);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ─────────────────────────────────────────────────
   MOBILE BURGER MENU
───────────────────────────────────────────────── */
function initMobileMenu() {
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');
  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ─────────────────────────────────────────────────
   SMOOTH SCROLL for anchor links
───────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initReveal();
  init().catch(err => console.error('Portfolio init error:', err));
});
